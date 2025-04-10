package com.jpdevland.foodyheaven.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateFoodItemRequest {

    @NotBlank(message = "Food item name cannot be blank")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    private String description;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
    private BigDecimal price;

    @URL(message = "Image URL must be a valid URL")
    @Size(max = 2048, message = "Image URL too long")
    private String imageUrl;

    private List<@NotBlank @Size(max=50) String> tags;

    @NotNull // Availability must be specified on update
    private Boolean available;
}
