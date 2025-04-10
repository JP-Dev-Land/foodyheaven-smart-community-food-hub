package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.OrderDTO;
import com.jpdevland.foodyheaven.backend.dto.PlaceOrderRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.UpdateOrderStatusRequestDTO;
import com.jpdevland.foodyheaven.backend.service.OrderService;
import com.jpdevland.foodyheaven.backend.service.impl.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders - Place a new order (Customer)
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Any logged-in user can place an order
    public ResponseEntity<OrderDTO> placeOrder(
            @Valid @RequestBody PlaceOrderRequestDTO request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        OrderDTO createdOrder = orderService.placeOrder(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    // GET /api/orders/my - Get orders for the logged-in customer
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<OrderDTO> orders = orderService.getOrdersByCustomerId(currentUser.getId());
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/{id} - Get specific order details (Customer, Cook, Agent, Admin)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        // Authorization check happens within the service layer
        OrderDTO order = orderService.getOrderById(id, currentUser.getId());
        return ResponseEntity.ok(order);
    }

    // GET /api/orders/cook - Get orders assigned to the logged-in cook
    @GetMapping("/cook")
    @PreAuthorize("hasRole('ROLE_COOK')")
    public ResponseEntity<List<OrderDTO>> getCookOrders(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<OrderDTO> orders = orderService.getOrdersByCookId(currentUser.getId());
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/delivery - Get orders assigned to the logged-in delivery agent
    @GetMapping("/delivery")
    @PreAuthorize("hasRole('ROLE_DELIVERY_AGENT')")
    public ResponseEntity<List<OrderDTO>> getDeliveryAgentOrders(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        List<OrderDTO> orders = orderService.getOrdersByDeliveryAgentId(currentUser.getId());
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/available-for-delivery - Get orders ready for pickup (Delivery Agents)
    @GetMapping("/available-for-delivery")
    @PreAuthorize("hasRole('ROLE_DELIVERY_AGENT')")
    public ResponseEntity<List<OrderDTO>> getAvailableDeliveries() {
        List<OrderDTO> orders = orderService.getOrdersAvailableForDelivery();
        return ResponseEntity.ok(orders);
    }

    // PUT /api/orders/{id}/status - Update order status (Cook, Admin, sometimes Agent)
    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()") // Role/ownership check happens in service
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {

        OrderDTO updatedOrder = orderService.updateOrderStatus(id, request, currentUser.getId());
        return ResponseEntity.ok(updatedOrder);
    }

    // TODO: Future endpoints for assigning delivery agent, etc.
}