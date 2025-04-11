package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.OrderDTO;
import com.jpdevland.foodyheaven.backend.dto.PlaceOrderRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateOrderStatusRequestDTO;
import com.jpdevland.foodyheaven.backend.service.impl.OSRMRoutingService;
import com.jpdevland.foodyheaven.backend.dto.AssignAgentRequestDTO; // Create this DTO

import java.util.List;

public interface OrderService {
    OrderDTO placeOrder(PlaceOrderRequestDTO request, Long customerId);
    OrderDTO getOrderById(Long orderId, Long userId); // userId for auth check
    List<OrderDTO> getOrdersByCustomerId(Long customerId);
    List<OrderDTO> getOrdersByCookId(Long cookId);
    List<OrderDTO> getOrdersByDeliveryAgentId(Long deliveryAgentId);
    List<OrderDTO> getOrdersAvailableForDelivery();
    OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequestDTO request, Long userId);
    OrderDTO assignDeliveryAgent(Long orderId, AssignAgentRequestDTO request, Long assigningUserId); // assigningUserId for auth/logging
    OSRMRoutingService.RouteResponse computeOptimalRoute(String origin, String destination);
    // Method for Admin assignment
    OrderDTO assignDeliveryAgentByAdmin(Long orderId, AssignAgentRequestDTO request);

    // Method for Agent self-assignment
    OrderDTO acceptDelivery(Long orderId, Long agentId);
}