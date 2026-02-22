package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "HouseholdUser",
    description = "Información básica de un miembro de un hogar"
)
public class HouseholdUserDto {

    @Schema(description = "Identificador del usuario", example = "2")
    private Long userId;
    @Schema(description = "Nombre y apellidos del usuario", example = "Daniel Rivera")
    private String fullName;
    @Schema(description = "Correo electrónico del usuario", example = "user@mail.com")
    private String userEmail;
    @Schema(description = "URL o identificador del avatar del usuario", example = "avatar.png")
    private String userAvatar;
    @Schema(description = "Indica si el usuario es administrador del hogar", example = "false")
    private Boolean isAdmin;

    public HouseholdUserDto() {}


    public HouseholdUserDto(Long userId, String fullName, String userEmail, String userAvatar, Boolean isAdmin) {
        this.userId = userId;
        this.fullName = fullName;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
        this.isAdmin = isAdmin;
    }
    
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUserEmail() {
        return userEmail;
    }
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserAvatar() {
        return userAvatar;
    }
    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }
    
    public Boolean getIsAdmin() {
        return isAdmin;
    }
    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

}
