package com.jpdevland.foodyheaven.backend.dto;

import com.jpdevland.foodyheaven.backend.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequestDTO {
    @NotNull
    private OrderStatus newStatus;
}