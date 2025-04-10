package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.OrderDTO;
import com.jpdevland.foodyheaven.backend.dto.PlaceOrderRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateOrderStatusRequestDTO;
import com.jpdevland.foodyheaven.backend.model.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderDTO placeOrder(PlaceOrderRequestDTO request, Long customerId);
    OrderDTO getOrderById(Long orderId, Long userId); // userId for auth check
    List<OrderDTO> getOrdersByCustomerId(Long customerId);
    List<OrderDTO> getOrdersByCookId(Long cookId);
    List<OrderDTO> getOrdersByDeliveryAgentId(Long deliveryAgentId);
    List<OrderDTO> getOrdersAvailableForDelivery();
    OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequestDTO request, Long userId);
    // Future: assignDeliveryAgent(Long orderId, Long deliveryAgentId, Long assigningUserId);
}