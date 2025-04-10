package com.jpdevland.foodyheaven.backend.service.impl;

import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Username here is actually the email in your setup
        User user = userRepository.findByUsername(username) // Find by email column
                .orElseThrow(() ->
                        new UsernameNotFoundException("User with username (email) '" + username + "' not found."));

        // Use the static build method from UserDetailsImpl
        return UserDetailsImpl.build(user);
    }
}