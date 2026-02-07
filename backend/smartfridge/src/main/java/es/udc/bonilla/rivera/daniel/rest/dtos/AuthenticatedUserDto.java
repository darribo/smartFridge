package es.udc.bonilla.rivera.daniel.rest.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "AuthenticatedUser",
    description = "Resultado de una autenticación correcta. Incluye el token de acceso y los datos del usuario."
)
public class AuthenticatedUserDto {

    @Schema(
        description = "Token JWT de acceso al servicio",
        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    )
    private String serviceToken;

    @Schema(
        description = "Datos del usuario autenticado"
    )
    private UserDto userDto;

    public AuthenticatedUserDto() {}

    public AuthenticatedUserDto(String serviceToken, UserDto userDto) {
        this.serviceToken = serviceToken;
        this.userDto = userDto;
    }

    public String getServiceToken() {
        return serviceToken;
    }
    public void setServiceToken(String serviceToken) {
        this.serviceToken = serviceToken;
    }

    @JsonProperty("user")
    public UserDto getUserDto() {
        return userDto;
    }

    public void setUserDto(UserDto userDto) {
        this.userDto = userDto;
    }

}
