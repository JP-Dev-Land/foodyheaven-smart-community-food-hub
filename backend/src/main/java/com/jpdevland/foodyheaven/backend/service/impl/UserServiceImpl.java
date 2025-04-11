package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.dto.*;
import com.jpdevland.foodyheaven.backend.exception.InvalidOperationException;
import com.jpdevland.foodyheaven.backend.exception.ResourceNotFoundException;
import com.jpdevland.foodyheaven.backend.model.Role;
import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserSummaryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailDTO getUserById(Long id) {
        return mapToUserDetailDTO(findUserOrThrow(id));
    }

    @Override
    @Transactional
    public UserDetailDTO createUser(CreateUserRequestDTO request) {
        // 1. Check if username (email) already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new InvalidOperationException("Username (email) '" + request.getUsername() + "' is already taken.");
        }

        // 2. Create new User entity
        User newUser = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Encode the password!
                .roles(new HashSet<>(request.getRoles())) // Initialize with requested roles
                .enabled(request.getEnabled())
                .available(false) // Default availability for new users
                .build();

        newUser.getRoles().add(Role.ROLE_USER);

        User savedUser = userRepository.save(newUser);

        return mapToUserDetailDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDetailDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = findUserOrThrow(id);
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setRoles(request.getRoles());
        user.setEnabled(request.getEnabled());
        return mapToUserDetailDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        if (!user.isEnabled()) return;
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentUserProfile(Long userId) {
        return mapToUserProfileDTO(findUserOrThrow(userId));
    }

    @Override
    @Transactional
    public UserProfileDTO updateCurrentUserProfile(Long userId, UpdateProfileRequestDTO request) {
        User user = findUserOrThrow(userId);
        user.setName(request.getName());
        return mapToUserProfileDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void updateAvailability(Long userId, boolean available, Long requestingUserId) {
        User user = findUserOrThrow(userId);

        // Authorization: User can only update their own availability, or an Admin can update anyone's.
        boolean isAdmin = userRepository.findById(requestingUserId)
            .map(u -> u.getRoles().contains(Role.ROLE_ADMIN))
            .orElse(false);

        if (!userId.equals(requestingUserId) && !isAdmin) {
            throw new AccessDeniedException("User not authorized to update availability for user ID: " + userId);
        }

        // Validation: Ensure user is a delivery agent if setting available to true
        if (available && !user.getRoles().contains(Role.ROLE_DELIVERY_AGENT)) {
            throw new InvalidOperationException("User must have ROLE_DELIVERY_AGENT to be marked as available.");
        }

        if (user.isAvailable() != available) {
            user.setAvailable(available);
            userRepository.save(user);
            System.out.println("User " + userId + " availability set to: " + available); // Debugging
            // TODO: Optionally broadcast availability change via WebSocket if needed
            // String destination = "/topic/agents/availability";
            // messagingTemplate.convertAndSend(destination, Map.of("userId", userId, "available", available));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAvailableDeliveryAgents() {
        return userRepository.findByAvailableTrue().stream()
                .filter(user -> user.getRoles().contains(Role.ROLE_DELIVERY_AGENT))
                .map(this::mapToUserProfileDTO)
                .collect(Collectors.toList());
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private UserSummaryDTO mapToUserSummaryDTO(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRoles(),
                user.isEnabled()
        );
    }

    private UserDetailDTO mapToUserDetailDTO(User user) {
        return new UserDetailDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRoles(),
                user.isEnabled()
        );
    }

    private UserProfileDTO mapToUserProfileDTO(User user) {
        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRoles(),
                user.isAvailable()
        );
    }
}
