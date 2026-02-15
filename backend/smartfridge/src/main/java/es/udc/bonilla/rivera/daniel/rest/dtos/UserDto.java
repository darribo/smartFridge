package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "User",
    description = "DTO que representa a un usuario del sistema"
)    
public class UserDto {

    @Schema(
        description = "Identificador único del usuario",
        example = "42"
    )
    private Long id;

    @Schema(
        description = "Nombre de usuario",
        example = "darribo1501"
    )
    private String userName;

    @Schema(
        description = "Correo electrónico del usuario",
        example = "darribo1501@gmail.com"
    )
    private String email;

    @Schema(
        description = "Nombre real del usuario",
        example = "Daniel"
    )
    private String firstName;

    @Schema(
        description = "Apellidos del usuario",
        example = "Rivera Bonilla"
    )
    private String lastName;

    @Schema(
        description = "Avatar del usuario (URL o imagen en Base64)",
        example = "https://example.com/avatar.png"
    )
    private String avatar;

    @Schema(
        description = "Rol del usuario dentro del sistema",
        example = "USER",
        allowableValues = { "USER", "ADMIN" }
    )
    private String role;

    public UserDto() {}

    public UserDto(Long userId, String userName, String email, String firstName, String lastName, String avatar, String role) {
        this.id = userId;
        this.userName = userName;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatar = avatar;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

}
