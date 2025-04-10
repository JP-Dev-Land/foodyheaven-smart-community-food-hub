package com.jpdevland.foodyheaven.backend.service;

import com.jpdevland.foodyheaven.backend.dto.UserDTO;
import com.jpdevland.foodyheaven.backend.mapper.UserMapper;
import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Optional, but good practice

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true) // Good practice for read operations
    public UserDTO getCurrentUserDto(UserDetails principal) {
        if (principal == null) {
            throw new IllegalStateException("Cannot get current user details without authenticated principal.");
        }
        String username = principal.getUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        System.out.println("UserRetrieved: " + user);
        return userMapper.toDto(user);
    }

    // Optional: You might add other user-related service methods here later
    @Transactional(readOnly = true)
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
