package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.*;
import com.jpdevland.foodyheaven.backend.dto.UpdateAvailabilityRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.AdminAnalyticsDTO; // Add import
import com.jpdevland.foodyheaven.backend.dto.CreateUserRequestDTO; // Add import
import com.jpdevland.foodyheaven.backend.service.UserService;
import com.jpdevland.foodyheaven.backend.service.AnalyticsService; // Add import
import com.jpdevland.foodyheaven.backend.service.impl.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // Add import
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final AnalyticsService analyticsService; // Inject AnalyticsService

    // --- User Management Endpoints ---
    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        List<UserSummaryDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // GET /api/admin/users/{id}
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Long id) {
        UserDetailDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // POST /api/admin/users
    @PostMapping("/users")
    public ResponseEntity<UserDetailDTO> createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        UserDetailDTO createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // PUT /api/admin/users/{id}
    @PutMapping("/users/{id}")
    public ResponseEntity<UserDetailDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {
        UserDetailDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/admin/users/{userId}/availability
    @PutMapping("/users/{userId}/availability")
    public ResponseEntity<Void> updateAgentAvailability(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateAvailabilityRequestDTO request,
            @AuthenticationPrincipal UserDetailsImpl adminUser) {
        userService.updateAvailability(userId, request.getAvailable(), adminUser.getId());
        return ResponseEntity.ok().build();
    }

    // --- Analytics Endpoint ---
    // GET /api/admin/analytics/dashboard
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<AdminAnalyticsDTO> getDashboardAnalytics() {
        AdminAnalyticsDTO analytics = analyticsService.getAdminDashboardAnalytics();
        return ResponseEntity.ok(analytics);
    }
}