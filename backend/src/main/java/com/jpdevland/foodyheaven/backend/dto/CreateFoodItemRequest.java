package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.URL; // image URL validation

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateFoodItemRequest {

    @NotBlank(message = "Food item name cannot be blank")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    private String description; // Optional

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @URL(message = "Image URL must be a valid URL")
    @Size(max = 2048, message = "Image URL too long")
    private String imageUrl; // Optional

    private List<@NotBlank @Size(max=50) String> tags; // Optional tags

    private boolean available = true; // Default to true, can be overridden
}
