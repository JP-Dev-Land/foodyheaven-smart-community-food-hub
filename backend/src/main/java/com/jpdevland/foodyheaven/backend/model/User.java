package com.jpdevland.foodyheaven.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder; // Add Builder
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet; // Use HashSet for initialization
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Add Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String username; // email

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id")) // join table
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Builder.Default // Default to enabled
    @Column(nullable = false)
    private boolean enabled = true; // For soft deleting/disabling users

    @Builder.Default // Default availability to false for new users
    @Column(nullable = false)
    private boolean available = false; // For delivery agent availability status
}