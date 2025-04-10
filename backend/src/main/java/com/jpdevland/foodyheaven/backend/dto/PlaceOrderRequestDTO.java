package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequestDTO {
    @NotEmpty
    @Valid // Validate each item in the list
    private List<CartItemDTO> items;

    // TODO: Future fields: deliveryAddress, paymentMethodId, specialInstructions etc.
}