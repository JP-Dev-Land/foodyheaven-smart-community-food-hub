package com.jpdevland.foodyheaven.backend.dto;

import com.jpdevland.foodyheaven.backend.model.Role;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class CreateUserRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String username; // Treat as email

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    // TODO: Add more password complexity validation if needed (e.g., @Pattern)
    private String password;

    @NotEmpty(message = "At least one role must be selected")
    private Set<Role> roles;

    @NotNull(message = "Enabled status must be specified (true/false)")
    private Boolean enabled = true; // Default to true
}