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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    // Inject UserDetailsServiceImpl or directly SecurityContextHolder logic for role check
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    @Transactional
    public OrderDTO placeOrder(PlaceOrderRequestDTO request, Long customerId) {
        User customer = findUserOrThrow(customerId);

        // 1. Fetch all required FoodItems at once for efficiency
        List<Long> foodItemIds = request.getItems().stream()
                .map(CartItemDTO::getFoodItemId)
                .distinct()
                .toList();
        Map<Long, FoodItem> foodItemsById = foodItemRepository.findAllById(foodItemIds).stream()
                .collect(Collectors.toMap(FoodItem::getId, Function.identity()));

        // 2. Validate items and determine the cook (Assume first item determines the cook for V1)
        // More complex logic could group by cookId and create multiple orders.
        if (request.getItems().isEmpty()) {
            throw new InvalidOperationException("Cannot place an empty order.");
        }
        Long firstItemId = request.getItems().getFirst().getFoodItemId();
        FoodItem firstFoodItem = foodItemsById.get(firstItemId);
        if (firstFoodItem == null) {
            throw new ResourceNotFoundException("FoodItem", "id", firstItemId);
        }
        User cook = firstFoodItem.getCook(); // Assuming FoodItem has cook reference loaded or fetched

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
            // V1 Check: Ensure all items are from the same cook (derived from the first item)
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

        // 3. Create the Order
        Order order = Order.builder()
                .customer(customer)
                .cook(cook) // Assign the determined cook
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        // 4. Add items to the order (maintains bidirectional link)
        orderItems.forEach(order::addItem);

        // 5. Save the order (cascades to save items)
        Order savedOrder = orderRepository.save(order);

        return mapEntityToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, Long userId) {
        Order order = findOrderOrThrow(orderId);
        User user = findUserOrThrow(userId);

        // Authorization Check: Allow customer, cook, delivery agent, or admin
        boolean isCustomer = order.getCustomer().getId().equals(userId);
        boolean isCook = order.getCook().getId().equals(userId);
        boolean isDeliveryAgent = order.getDeliveryAgent() != null && order.getDeliveryAgent().getId().equals(userId);
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.name().equals("ROLE_ADMIN")); // Assuming Role enum exists

        if (!isCustomer && !isCook && !isDeliveryAgent && !isAdmin) {
            throw new UnauthorizedAccessException("User not authorized to view this order.");
        }

        return mapEntityToDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        findUserOrThrow(customerId); // Validate user exists
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCookId(Long cookId) {
        findUserOrThrow(cookId); // Validate user exists
        return orderRepository.findByCookIdOrderByCreatedAtDesc(cookId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByDeliveryAgentId(Long deliveryAgentId) {
        findUserOrThrow(deliveryAgentId); // Validate user exists
        return orderRepository.findByDeliveryAgentIdOrderByCreatedAtDesc(deliveryAgentId).stream()
                .map(this::mapEntityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersAvailableForDelivery() {
        // Example: Find orders ready for pickup that haven't been assigned
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

        // Authorization: Only Cook, assigned Delivery Agent (for some transitions), or Admin can update status
        boolean isCook = order.getCook().getId().equals(userId);
        boolean isDeliveryAgent = order.getDeliveryAgent() != null && order.getDeliveryAgent().getId().equals(userId);
        // Use UserDetails for roles
        boolean isAdmin = userDetailsService.loadUserByUsername(user.getUsername())
                .getAuthorities()
                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        // Add more granular checks based on status transitions if needed
        if (!isCook && !isAdmin && !(isDeliveryAgent && canDeliveryAgentUpdate(order.getStatus(), request.getNewStatus()))) {
            throw new UnauthorizedAccessException("User not authorized to update status for this order.");
        }

        // TODO: Add logic to validate status transitions (e.g., can't go from DELIVERED back to COOKING)

        order.setStatus(request.getNewStatus());
        Order updatedOrder = orderRepository.save(order);
        // TODO: Trigger WebSocket notification here (Phase 6)
        return mapEntityToDTO(updatedOrder);
    }

    // --- Helper Methods ---

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private Order findOrderOrThrow(Long orderId) {
        // Fetch with items to avoid lazy loading issues during mapping
        return orderRepository.findById(orderId) // Consider creating findByIdWithItems variant if needed often
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    // Example helper for status transition validation by delivery agent
    private boolean canDeliveryAgentUpdate(OrderStatus currentStatus, OrderStatus newStatus) {
        // Delivery agent can mark as OUT_FOR_DELIVERY or DELIVERED
        return (currentStatus == OrderStatus.READY_FOR_PICKUP && newStatus == OrderStatus.OUT_FOR_DELIVERY) ||
                (currentStatus == OrderStatus.OUT_FOR_DELIVERY && newStatus == OrderStatus.DELIVERED);
    }

    private OrderDTO mapEntityToDTO(Order entity) {
        return OrderDTO.builder()
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
    }

    private OrderItemDTO mapItemEntityToDTO(OrderItem itemEntity) {
        return OrderItemDTO.builder()
                .id(itemEntity.getId())
                .foodItemId(itemEntity.getFoodItem().getId())
                .foodItemName(itemEntity.getFoodItemNameAtOrderTime()) // Use stored name
                .quantity(itemEntity.getQuantity())
                .priceAtOrderTime(itemEntity.getPriceAtOrderTime())
                .foodItemImageUrl(itemEntity.getFoodItem().getImageUrl()) // Get image URL from related FoodItem
                .build();
    }
}