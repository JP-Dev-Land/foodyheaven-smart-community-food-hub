package com.jpdevland.foodyheaven.backend.mapper;

import com.jpdevland.foodyheaven.backend.dto.UserDTO;
import com.jpdevland.foodyheaven.backend.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
    User toEntity(UserDTO dto);
}