package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.UpdateUserRequestDTO;
import com.jpdevland.foodyheaven.backend.dto.UserDetailDTO;
import com.jpdevland.foodyheaven.backend.dto.UserSummaryDTO;
import com.jpdevland.foodyheaven.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ROLE_ADMIN')") // Ensure only Admins can access methods in this controller
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    // GET /api/admin/users - List all users
    @GetMapping
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        List<UserSummaryDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // GET /api/admin/users/{id} - Get specific user details
    @GetMapping("/{id}")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Long id) {
        UserDetailDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // PUT /api/admin/users/{id} - Update user details (including roles)
    @PutMapping("/{id}")
    public ResponseEntity<UserDetailDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request) {
        UserDetailDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    // DELETE /api/admin/users/{id} - Delete (or disable) a user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build(); // 204 No Content on success
    }
}