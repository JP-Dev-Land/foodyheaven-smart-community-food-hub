package com.jpdevland.foodyheaven.backend.dto;

import lombok.Data;

import javax.management.relation.Role;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private Role role;
}
