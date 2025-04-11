package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.dto.AdminAnalyticsDTO;
import com.jpdevland.foodyheaven.backend.model.Order;
import com.jpdevland.foodyheaven.backend.model.OrderStatus;
import com.jpdevland.foodyheaven.backend.model.Role;
import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.OrderRepository;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true) // Read-only transaction for analytics
    public AdminAnalyticsDTO getAdminDashboardAnalytics() {

        // Fetch all orders and users once for efficiency
        List<Order> allOrders = orderRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        // Calculate Total Orders
        long totalOrders = allOrders.size();

        // Calculate Total Revenue (e.g., from DELIVERED orders only)
        BigDecimal totalRevenue = allOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate User Counts
        long totalUsers = allUsers.size();
        long totalCooks = allUsers.stream()
                .filter(user -> user.getRoles().contains(Role.ROLE_COOK))
                .count();
        long totalDeliveryAgents = allUsers.stream()
                .filter(user -> user.getRoles().contains(Role.ROLE_DELIVERY_AGENT))
                .count();

        // Calculate Orders by Status
        Map<String, Long> ordersByStatus = allOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getStatus().name(), Collectors.counting()));

        // Calculate Users by Role (counting each role occurrence)
        Map<String, Long> usersByRole = allUsers.stream()
                .flatMap(user -> user.getRoles().stream()) // Flatten the stream of roles
                .collect(Collectors.groupingBy(Role::name, Collectors.counting()));

        // Build the DTO
        return AdminAnalyticsDTO.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalUsers(totalUsers)
                .totalCooks(totalCooks)
                .totalDeliveryAgents(totalDeliveryAgents)
                .ordersByStatus(ordersByStatus)
                .usersByRole(usersByRole)
                .build();
    }
}