package com.jpdevland.foodyheaven.backend.controller.portected;

import com.jpdevland.foodyheaven.backend.model.User;
import com.jpdevland.foodyheaven.backend.repo.UserRepository;
import com.jpdevland.foodyheaven.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/protected")
public class UserController {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public String getUser(RequestHeader requestHeader) {
//        String username = "user@gmail.com";
//        String authHeader = requestHeader.toString();
//        if(authHeader != null && authHeader.startsWith("Bearer ")) {
//            String token = authHeader.substring(7);
//            username = jwtUtil.extractUsername(token);
//        }
//        return userRepository.findByUsername(username);
            return "user";
    }
}
