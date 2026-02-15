package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.services.AllergyService;
import es.udc.bonilla.rivera.daniel.model.services.UserService;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IncorrectLoginException;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.common.JwtGenerator;
import es.udc.bonilla.rivera.daniel.rest.common.JwtInfo;
import es.udc.bonilla.rivera.daniel.rest.dtos.AuthenticatedUserDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.LoginParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewUserParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(
    name = "Usuarios",
    description = "Operaciones relacionadas con usuarios, sus datos y sus alergias."
)
@RestController
@RequestMapping("/users")
public class UserController {

    private static final String INCORRECT_LOGIN_EXCEPTION_CODE = "project.exceptions.IncorrectLoginException";

    @Autowired
    private JwtGenerator jwtGenerator;

    @Autowired
    private UserService userService;

    @Autowired
    private AllergyService allergyService;

    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(IncorrectLoginException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ErrorsDto handleIncorrectLoginException(IncorrectLoginException exception, Locale locale) {

		String errorMessage = messageSource.getMessage(INCORRECT_LOGIN_EXCEPTION_CODE, null,
				INCORRECT_LOGIN_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

    @Operation(
        summary = "Crear un nuevo usuario",
        description = "Crea un nuevo usuario con sus datos y alergias asociadas."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario creado",
            content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
        @ApiResponse(responseCode = "404", description = "Alergia no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Nombre de usuario o email duplicado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/signUp")
    public ResponseEntity<AuthenticatedUserDto> signUp(@Validated @RequestBody NewUserParamsDto userDto) throws InstanceNotFoundException, DuplicateInstanceException {

        List<Allergy> allergies = new ArrayList<>();

        
        if (userDto.getAllergyIds() != null) {
            for(Long allergyId : userDto.getAllergyIds()) {
                Allergy allergy = allergyService.getAllergy(allergyId);
                allergies.add(allergy);
            }
        }

        User user = userService.signUp(userDto.getUserName(), userDto.getPassword(), userDto.getEmail(), userDto.getFirstName(), userDto.getLastName(), userDto.getAvatar());

        for(Allergy allergy : allergies) {
            userService.addUserAllergy(user.getId(), allergy.getId());
        }

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(user.getId()).toUri();

        String serviceToken = generateServiceToken(user);

        UserDto createdUserDto = UserConversor.toUserDto(user);

        return ResponseEntity.created(location).body(UserConversor.toAuthenticatedUserDto(serviceToken, createdUserDto));
    }

    @Operation(
        summary = "Iniciar sesión",
        description = "Autentica un usuario con su nombre de usuario y contraseña."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario autenticado",
            content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
        @ApiResponse(responseCode = "404", description = "Credenciales incorrectas",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/login")
    public AuthenticatedUserDto login (@Validated @RequestBody LoginParamsDto dto) throws IncorrectLoginException {

        User user = userService.login(dto.getUserName(), dto.getPassword());

        return new AuthenticatedUserDto(generateServiceToken(user), UserConversor.toUserDto(user));
    }

    @Operation(
        summary = "Renovar sesión con token",
        description = "Recupera los datos del usuario autenticado a partir del token de servicio."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario autenticado",
            content = @Content(schema = @Schema(implementation = AuthenticatedUserDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping("/loginFromServiceToken")
	public AuthenticatedUserDto loginFromServiceToken(@RequestAttribute Long userId,
			@RequestAttribute String serviceToken) throws InstanceNotFoundException {

		User user = userService.loginFromId(userId);

		return new AuthenticatedUserDto(serviceToken, UserConversor.toUserDto(user));
	}


    private String generateServiceToken(User user) {

        JwtInfo jwtInfo = new JwtInfo(user.getId(), user.getUserName(), user.getRole().toString());

        return jwtGenerator.generateAccessToken(jwtInfo);
    }

    
    
    
}
