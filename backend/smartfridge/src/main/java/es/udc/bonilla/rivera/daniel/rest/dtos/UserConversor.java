package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.User;

public class UserConversor {

    private UserConversor() {}

    public static final UserDto toUserDto(User user) {
        return new UserDto(user.getId(), user.getUserName(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getAvatar(), user.getRole().toString());
    }

    public static final AuthenticatedUserDto toAuthenticatedUserDto(String serviceToken, UserDto userDto) {
        return new AuthenticatedUserDto(serviceToken, userDto);
    }

}
