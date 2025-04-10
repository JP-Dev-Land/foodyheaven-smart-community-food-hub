package com.jpdevland.foodyheaven.backend.controller;

import com.jpdevland.foodyheaven.backend.dto.UserDTO;
import com.jpdevland.foodyheaven.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users") // Base path for user-related endpoints
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me") // Endpoint: /api/users/me
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // @AuthenticationPrincipal injects the currently logged-in user's details
        if (userDetails == null) {
            // This case should ideally be prevented by security rules, but good as a safeguard
            return ResponseEntity.status(401).build(); // Or handle as appropriate
        }
        UserDTO userDto = userService.getCurrentUserDto(userDetails);
        return ResponseEntity.ok(userDto);
    }
}