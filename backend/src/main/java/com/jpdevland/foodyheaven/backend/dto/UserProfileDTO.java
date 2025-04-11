package com.jpdevland.foodyheaven.backend.dto;

import lombok.*;

import java.util.Set;
import com.jpdevland.foodyheaven.backend.model.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    private Long id;
    private String name;
    private String username; // email
    private Set<Role> roles;
    // Explicit setter for available field
    @Setter
    private boolean available;

}