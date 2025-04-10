package com.jpdevland.foodyheaven.backend.service.impl;

import com.fasterxml.jackson.annotation.JsonIgnore; // Important for password serialization
import com.jpdevland.foodyheaven.backend.model.User; // Your User entity
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    @Serial
    private static final long serialVersionUID = 1L; // Recommended for Serializable classes

    // <-- The crucial getter for the controller!
    @Getter
    private final Long id; // <-- The ID we need!
    // <-- Optional getter
    @Getter
    private final String name; // <-- Optional: nice to have
    private final String username; // Required by UserDetails (email in your case)

    @JsonIgnore // Prevent password from being accidentally serialized
    private final String password; // Required by UserDetails

    private final Collection<? extends GrantedAuthority> authorities; // Required by UserDetails

    // Constructor to build UserDetailsImpl from your User entity
    public UserDetailsImpl(Long id, String name, String username, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    // Static build method for convenience (common pattern)
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getName(),
                user.getUsername(), // This is the email
                user.getPassword(),
                authorities);
    }

    // --- UserDetails interface methods ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Returns the email, which Spring Security uses as the "username"
        return username;
    }

    // --- Account status methods (implement as needed, default to true) ---

    @Override
    public boolean isAccountNonExpired() {
        return true; // Implement logic if account expiration exists
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Implement logic if account locking exists
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Implement logic if password expiration exists
    }

    @Override
    public boolean isEnabled() {
        return true; // Implement logic if user disabling exists (e.g., user.isEnabled())
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return java.util.Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(id);
    }
}