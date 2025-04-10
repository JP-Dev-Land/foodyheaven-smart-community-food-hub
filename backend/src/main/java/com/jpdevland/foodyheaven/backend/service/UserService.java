package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.*;
import jakarta.validation.Valid;

import java.util.List;

public interface UserService {
    // Admin Operations
    List<UserSummaryDTO> getAllUsers();
    UserDetailDTO getUserById(Long id);
    UserDetailDTO createUser(CreateUserRequestDTO request);
    UserDetailDTO updateUser(Long id, UpdateUserRequestDTO request);
    void deleteUser(Long id);

    // Self-Service Operations
    UserProfileDTO getCurrentUserProfile(Long userId);
    UserProfileDTO updateCurrentUserProfile(Long userId, UpdateProfileRequestDTO request);
}
