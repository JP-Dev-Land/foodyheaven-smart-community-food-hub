package com.jpdevland.foodyheaven.backend.mapper;

import com.jpdevland.foodyheaven.backend.dto.UserDTO;
import com.jpdevland.foodyheaven.backend.model.Role;
import com.jpdevland.foodyheaven.backend.model.User;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", source = "roles")
    UserDTO toDto(User user);

    @AfterMapping
    default void afterToDto(User user, @MappingTarget UserDTO dto) {
        if (user.getRoles() != null) {
            dto.setRoles(
                    user.getRoles()
                            .stream()
                            .map(Role::name)
                            .collect(Collectors.toSet())
            );
        }
    }
}
