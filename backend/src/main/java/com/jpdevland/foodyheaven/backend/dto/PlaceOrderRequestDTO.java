package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

import com.jpdevland.foodyheaven.backend.model.Coordinates;

@Data
public class PlaceOrderRequestDTO {
    @NotEmpty
    @Valid // Validate each item in the list
    private List<CartItemDTO> items;

    @NotNull
    @Valid
    private Coordinates pickupLocation;

    @NotNull
    @Valid
    private Coordinates deliveryLocation;

    // TODO: Future fields: deliveryAddress, paymentMethodId, specialInstructions etc.
}