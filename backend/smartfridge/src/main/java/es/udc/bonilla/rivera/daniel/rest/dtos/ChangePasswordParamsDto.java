package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordParamsDto {

    private String oldPassword;
    private String newPassword;

    public ChangePasswordParamsDto() {}

    public ChangePasswordParamsDto(String oldPassword, String newPassword) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
    }

    @NotBlank
    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    @NotBlank
    @Size(min = 8, max = 100)
    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

}
