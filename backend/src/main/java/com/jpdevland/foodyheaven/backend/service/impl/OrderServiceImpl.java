package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.dto.*;
import com.jpdevland.foodyheaven.backend.exception.InvalidOperationException;
import com.jpdevland.foodyheaven.backend.exception.ResourceNotFoundException;
import com.jpdevland.foodyheaven.backend.exception.UnauthorizedAccessException;
import com.jpdevland.foodyheaven.backend.model.*;
import com.jpdevland.foodyheaven.backend.repo.FoodItemRepository;
import com.jpdevland.foodyheaven.backend.repo.OrderRepository;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.service.OrderService;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final OSRMRoutingService osrmRoutingService;

    @Override
    @Transactional
    public OrderDTO placeOrder(PlaceOrderRequestDTO request, Long customerId) {
        User customer = findUserOrThrow(customerId);

        List<Long> foodItemIds = request.getItems().stream()
                .map(CartItemDTO::getFoodItemId)
                .distinct()
                .toList();
        Map<Long, FoodItem> foodItemsById = foodItemRepository.findAllById(foodItemIds).stream()
                .collect(Collectors.toMap(FoodItem::getId, Function.identity()));

        if (request.getItems().isEmpty()) {
            throw new InvalidOperationException("Cannot place an empty order.");
        }
        Long firstItemId = request.getItems().getFirst().getFoodItemId();
        FoodItem firstFoodItem = foodItemsById.get(firstItemId);
        if (firstFoodItem == null) {
            throw new ResourceNotFoundException("FoodItem", "id", firstItemId);
        }
        User cook = firstFoodItem.getCook();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemDTO cartItem : request.getItems()) {
            FoodItem foodItem = foodItemsById.get(cartItem.getFoodItemId());
            if (foodItem == null) {
                throw new ResourceNotFoundException("FoodItem", "id", cartItem.getFoodItemId());
            }
            if (!foodItem.isAvailable()) {
                throw new InvalidOperationException("Food item '" + foodItem.getName() + "' is not available.");
            }
            if (!foodItem.getCook().getId().equals(cook.getId())) {
                throw new InvalidOperationException("All items in a single order must be from the same cook. Item '" + foodItem.getName() + "' is from a different cook.");
            }

            BigDecimal itemPrice = foodItem.getPrice();
            int quantity = cartItem.getQuantity();
            totalAmount = totalAmount.add(itemPrice.multiply(BigDecimal.valueOf(quantity)));

            OrderItem orderItem = OrderItem.builder()
                    .foodItem(foodItem)
                    .quantity(quantity)
                    .priceAtOrderTime(itemPrice)
                    .foodItemNameAtOrderTime(foodItem.getName())
                    .build();
            orderItems.add(orderItem);
        }

        Order order = Order.builder()
                .customer(customer)
                .cook(cook)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .pickupLocation(request.getPickupLocation())
                .deliveryLocation(request.getDeliveryLocation())
                .build();

        orderItems.forEach(order::addItem);

        Order savedOrder = orderRepository.save(order);

        return mapEntityToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, Long userId) {
        Order order = findOrderOrThrow(orderId);
        User user = findUserOrThrow(userId);

        boolean isCustomer = order.getCustomer().getId().equals(userId);
        boolean isCook = order.getCook().getId().equals(userId);
        boolean isDeliveryAgent = order.getDeliveryAgent() != null && order.getDeliveryAgent().getId().equals(userId);
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.name().equals("ROLE_ADMIN"));

        if (!isCustomer && !isCook && !isDeliveryAgent && !isAdmin) {
            throw new UnauthorizedAccessException("User not authorized to view this order.");
        }

        return mapEntityToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        findUserOrThrow(customerId);
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCookId(Long cookId) {
        findUserOrThrow(cookId);
        return orderRepository.findByCookIdOrderByCreatedAtDesc(cookId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDeliveryAgentId(Long deliveryAgentId) {
        findUserOrThrow(deliveryAgentId);
        return orderRepository.findByDeliveryAgentIdOrderByCreatedAtDesc(deliveryAgentId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersAvailableForDelivery() {
        return orderRepository.findByStatusAndDeliveryAgentIdIsNull(OrderStatus.READY_FOR_PICKUP)
                .stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequestDTO request, Long userId) {
        Order order = findOrderOrThrow(orderId);
        User user = findUserOrThrow(userId);
        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getNewStatus();

        boolean isCook = order.getCook().getId().equals(userId);
        boolean isDeliveryAgent = order.getDeliveryAgent() != null && order.getDeliveryAgent().getId().equals(userId);
        boolean isAdmin = userDetailsService.loadUserByUsername(user.getUsername())
                .getAuthorities()
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isCook && !isAdmin && !(isDeliveryAgent && canDeliveryAgentUpdate(oldStatus, newStatus))) {
            throw new UnauthorizedAccessException("User not authorized to update status for this order.");
        }

        validateStatusTransition(oldStatus, newStatus, user.getRoles());

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        OrderDTO updatedDto = mapEntityToDTO(updatedOrder);
        String destination = "/topic/orders/" + orderId + "/status";
        System.out.println("Sending status update to: " + destination);
        messagingTemplate.convertAndSend(destination, updatedDto);

        return updatedDto;
    }

    @Override
    @Transactional
    public OrderDTO assignDeliveryAgent(Long orderId, AssignAgentRequestDTO request, Long assigningUserId) {
        Order order = findOrderOrThrow(orderId);
        User assigningUser = findUserOrThrow(assigningUserId);

        if (!assigningUser.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new UnauthorizedAccessException("User not authorized to assign delivery agents.");
        }

        User deliveryAgent = userRepository.findById(request.getDeliveryAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("User (Delivery Agent)", "id", request.getDeliveryAgentId()));

        if (!deliveryAgent.getRoles().contains(Role.ROLE_DELIVERY_AGENT)) {
            throw new InvalidOperationException("User ID " + deliveryAgent.getId() + " is not a delivery agent.");
        }
        if (!deliveryAgent.isAvailable()) {
            throw new InvalidOperationException("Delivery agent " + deliveryAgent.getName() + " is not available.");
        }
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new InvalidOperationException("Order is not in READY_FOR_PICKUP status.");
        }
        if (order.getDeliveryAgent() != null) {
            throw new InvalidOperationException("Order already has an assigned delivery agent.");
        }

        order.setDeliveryAgent(deliveryAgent);

        Order updatedOrder = orderRepository.save(order);

        OrderDTO updatedDto = mapEntityToDTO(updatedOrder);
        String statusDestination = "/topic/orders/" + orderId + "/status";
        messagingTemplate.convertAndSend(statusDestination, updatedDto);
        String agentQueue = "/user/" + deliveryAgent.getUsername() + "/queue/assignments";
        messagingTemplate.convertAndSend(agentQueue, updatedDto);

        System.out.println("Assigned agent " + deliveryAgent.getId() + " to order " + orderId);

        return updatedDto;
    }

    @Override
    public OSRMRoutingService.RouteResponse computeOptimalRoute(String origin, String destination) {
        String[] originCoords = origin.split(",");
        String[] destinationCoords = destination.split(",");

        double originLat = Double.parseDouble(originCoords[0]);
        double originLng = Double.parseDouble(originCoords[1]);
        double destinationLat = Double.parseDouble(destinationCoords[0]);
        double destinationLng = Double.parseDouble(destinationCoords[1]);

        OSRMRoutingService.RouteResponse routeResponse = osrmRoutingService.getRoute(originLat, originLng, destinationLat, destinationLng);

        if (routeResponse.getRoutes().isEmpty()) {
            throw new RuntimeException("No routes found between the specified locations.");
        }

        return routeResponse;
    }

    @Override
    public OrderDTO assignDeliveryAgentByAdmin(Long orderId, AssignAgentRequestDTO request) {
        return null;
    }

    @Override
    public OrderDTO acceptDelivery(Long orderId, Long agentId) {
        return null;
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Order findOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    private boolean canDeliveryAgentUpdate(OrderStatus currentStatus, OrderStatus newStatus) {
        return (currentStatus == OrderStatus.READY_FOR_PICKUP && newStatus == OrderStatus.OUT_FOR_DELIVERY) ||
                (currentStatus == OrderStatus.OUT_FOR_DELIVERY && newStatus == OrderStatus.DELIVERED);
    }

    private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus, Set<Role> userRoles) {
        System.out.println("Validating transition from " + oldStatus + " to " + newStatus);
        if (oldStatus == OrderStatus.DELIVERED && newStatus != OrderStatus.DELIVERED) {
            throw new InvalidOperationException("Cannot change status of a delivered order.");
        }
    }

    private OrderDTO mapEntityToDTO(Order entity) {
        OrderDTO orderDTO = OrderDTO.builder()
                .id(entity.getId())
                .customerId(entity.getCustomer().getId())
                .customerName(entity.getCustomer().getName())
                .cookId(entity.getCook().getId())
                .cookName(entity.getCook().getName())
                .deliveryAgentId(entity.getDeliveryAgent() != null ? entity.getDeliveryAgent().getId() : null)
                .deliveryAgentName(entity.getDeliveryAgent() != null ? entity.getDeliveryAgent().getName() : null)
                .status(entity.getStatus())
                .totalAmount(entity.getTotalAmount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .items(entity.getItems().stream().map(this::mapItemEntityToDTO).collect(Collectors.toList()))
                .build();
        orderDTO.setPickupLocation(entity.getPickupLocation());
        orderDTO.setDeliveryLocation(entity.getDeliveryLocation());
        return orderDTO;
    }

    private OrderItemDTO mapItemEntityToDTO(OrderItem itemEntity) {
        return OrderItemDTO.builder()
                .id(itemEntity.getId())
                .foodItemId(itemEntity.getFoodItem().getId())
                .foodItemName(itemEntity.getFoodItemNameAtOrderTime())
                .quantity(itemEntity.getQuantity())
                .priceAtOrderTime(itemEntity.getPriceAtOrderTime())
                .foodItemImageUrl(itemEntity.getFoodItem().getImageUrl())
                .build();
    }
}