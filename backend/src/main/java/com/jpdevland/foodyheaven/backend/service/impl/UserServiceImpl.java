package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.dto.*;
import com.jpdevland.foodyheaven.backend.exception.ResourceNotFoundException;
import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
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
                user.getRoles()
        );
    }
}
