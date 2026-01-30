package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.User;

public class UserConversor {

    private UserConversor() {}

    public static final UserDto toUserDto(User user, List<Long> allergyIds) {
        return new UserDto(user.getId(), user.getUserName(), user.getPassword(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getAvatar(), user.getRole().toString(), allergyIds);
    }

    public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, UserDto userDto) {
        return new AuthenticatedUserDto(serviceToken, userDto);
    }

}
