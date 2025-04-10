package com.jpdevland.foodyheaven.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodItemDTO {
    private Long id;
    private Long cookId;        // ID of the cook
    private String cookName;    // Name of the cook (denormalized for convenience)
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private List<String> tags;
    private boolean available;

    private Instant createdAt;
    private Instant updatedAt;
}