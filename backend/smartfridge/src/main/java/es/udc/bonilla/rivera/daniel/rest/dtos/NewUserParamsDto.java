package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
    name = "NewUserParams",
    description = "Parámetros necesarios para el registro de un nuevo usuario"
)
public class NewUserParamsDto {

    @Schema(
        description = "Nombre de usuario único",
        example = "darribo1501",
        minLength = 1,
        maxLength = 50
    )
    private String userName;

    @Schema(
        description = "Contraseña del usuario (mínimo 8 caracteres)",
        example = "Str0ngPass123!",
        minLength = 8,
        maxLength = 100
    )
    private String password;

    @Schema(
        description = "Correo electrónico del usuario",
        example = "joaquin@email.com"
    )
    private String email;

    @Schema(
        description = "Nombre real del usuario",
        example = "Daniel",
        minLength = 1,
        maxLength = 50
    )
    private String firstName;

    @Schema(
        description = "Apellidos del usuario",
        example = "Rivera Bonilla",
        minLength = 1,
        maxLength = 50
    )
    private String lastName;

    @Schema(
        description = "Avatar del usuario (URL o imagen codificada en Base64)",
        example = "https://example.com/avatar.png"
    )
    private String avatar;

    @Schema(
        description = "Lista de identificadores de alergias asociadas al usuario",
        example = "[1, 3, 7]",
        nullable = true
    )
    private List<Long> allergyIds;

    public NewUserParamsDto() {}

    public NewUserParamsDto(String userName, String password, String email, String firstName, String lastName, String avatar, List<Long> allergyIds) {
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatar = avatar;
        this.allergyIds = allergyIds;
    }

    @NotNull
    @Size(min=1, max=50)
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

    @NotNull
    @Size(min=1, max=100)
    @Email(message = "{validation.email.invalid}")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @NotNull
    @Size(min=1, max=50)
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @NotNull
    @Size(min=1, max=50)
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @NotBlank
    /* @ValidBase64Image(
        maxBytes = 2_000_000, // 2 MB
        allowedMimeTypes = {"image/jpeg", "image/png", "image/webp"},
        allowDataUri = true
    ) */
   //TODO: Validar que es una imagen en base64 o una URL
    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public List<Long> getAllergyIds() {
        return allergyIds;
    }

    public void setAllergyIds(List<Long> allergyIds) {
        this.allergyIds = allergyIds;
    }

}
