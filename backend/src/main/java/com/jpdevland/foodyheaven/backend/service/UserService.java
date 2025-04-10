package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.*;

import java.util.List;

public interface UserService {

    List<UserSummaryDTO> getAllUsers();

    UserDetailDTO getUserById(Long id);

    UserDetailDTO updateUser(Long id, UpdateUserRequestDTO request);

    void deleteUser(Long id);

    UserProfileDTO getCurrentUserProfile(Long userId);

    UserProfileDTO updateCurrentUserProfile(Long userId, UpdateProfileRequestDTO request);
}
