package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class LoginParamsDto {

    private String userName;
    private String password;
    
    public LoginParamsDto(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    public LoginParamsDto() {}

    @NotNull
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @NotNull
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
