package com.jpdevland.foodyheaven.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class AdminAnalyticsDTO {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalUsers;
    private long totalCooks;
    private long totalDeliveryAgents;
    private Map<String, Long> ordersByStatus; // e.g., {"PENDING": 10, "DELIVERED": 50}
    private Map<String, Long> usersByRole;    // e.g., {"ROLE_USER": 100, "ROLE_COOK": 5}
    // Add more complex analytics later if needed:
//     private Map<String, BigDecimal> revenueByCook;
//     private Map<String, Long> ordersByCook;
}
