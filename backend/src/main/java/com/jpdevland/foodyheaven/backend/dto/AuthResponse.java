package com.jpdevland.foodyheaven.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
}
