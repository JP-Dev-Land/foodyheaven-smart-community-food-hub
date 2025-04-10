package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.UpdateProfileRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.UserProfileDTO;
import com.jpdevland.foodyheaven.backend.service.UserService;
import com.jpdevland.foodyheaven.backend.service.impl.UserDetailsImpl; // Assuming from Phase 3
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users") // Base path for user-related actions
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me - Get current logged-in user's profile
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        UserProfileDTO profile = userService.getCurrentUserProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    // PUT /api/users/me - Update current logged-in user's profile (e.g., name)
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody UpdateProfileRequestDTO request) {
        UserProfileDTO updatedProfile = userService.updateCurrentUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedProfile);
    }

    // TODO: Add endpoint for changing password in future
    // POST /api/users/me/change-password
}