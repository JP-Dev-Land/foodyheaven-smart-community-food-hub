package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequestDTO {
    @NotBlank
    private String name;
    // Only allow updating name through this DTO for now TODO: update later
}