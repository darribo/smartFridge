package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LoginParamsDto {

    private String userName;
    private String password;
    
    public LoginParamsDto(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    public LoginParamsDto() {}

    @NotNull
    @Size(min=3, max=50)
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @NotNull
    @Size(min=8, max=100)
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
