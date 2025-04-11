package com.jpdevland.foodyheaven.backend.dto;

import com.jpdevland.foodyheaven.backend.model.Coordinates;
import com.jpdevland.foodyheaven.backend.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long cookId;
    private String cookName;
    private Long deliveryAgentId;
    private String deliveryAgentName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private Instant createdAt;
    private Instant updatedAt;
    private List<OrderItemDTO> items;
    private Coordinates pickupLocation;
    private Coordinates deliveryLocation;
}