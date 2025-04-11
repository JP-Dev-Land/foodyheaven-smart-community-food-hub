package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAvailabilityRequestDTO {
    @NotNull(message = "Availability status (true/false) is required")
    private Boolean available;
}