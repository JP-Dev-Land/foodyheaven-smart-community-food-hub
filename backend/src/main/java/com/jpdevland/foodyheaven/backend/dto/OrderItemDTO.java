package com.jpdevland.foodyheaven.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private Integer quantity;
    private BigDecimal priceAtOrderTime;
    private String foodItemImageUrl; // Added for frontend display
}