package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemDTO {
    @NotNull
    private Long foodItemId;

    @NotNull
    @Min(1)
    private Integer quantity;
}