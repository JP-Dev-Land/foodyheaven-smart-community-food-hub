package com.jpdevland.foodyheaven.backend.dto;

import lombok.Data;

import javax.management.relation.Role;

@Data
public class ResponseUser {
    private String username;
    private Role role;
}
