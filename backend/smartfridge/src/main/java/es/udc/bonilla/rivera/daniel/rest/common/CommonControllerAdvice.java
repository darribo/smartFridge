package es.udc.bonilla.rivera.daniel.rest.common;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@ControllerAdvice
public class CommonControllerAdvice {

    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";
    private static final String DUPLICATE_INSTANCE_EXCEPTION_CODE = "project.exceptions.DuplicateInstanceException";

    @Autowired
    private MessageSource messageSource;


	@ApiResponse(
        responseCode = "400",
        description = "Error de validación de cuerpo (Bean Validation en @RequestBody). Devuelve una lista de errores por campo.",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ErrorsDto.class),
            examples = @ExampleObject(
                name = "Errores de validación",
                value = """
                {
                  "fieldErrors": [
                    { "field": "email", "message": "Formato de email inválido" },
                    { "field": "password", "message": "Debe tener al menos 8 caracteres" }
                  ]
                }
                """
            )
        )
    )
    @ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorsDto handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {

		List<FieldErrorDto> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
				.map(error -> new FieldErrorDto(error.getField(), error.getDefaultMessage()))
				.collect(Collectors.toList());

		return new ErrorsDto(fieldErrors);

	}

	@ApiResponse(
        responseCode = "404",
        description = "Recurso no encontrado (InstanceNotFoundException). Devuelve un mensaje global.",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ErrorsDto.class),
            examples = @ExampleObject(
                name = "No encontrado",
                value = """
                {
                  "globalError": "No existe el usuario con id 42"
                }
                """
            )
        )
    )
	@ExceptionHandler(InstanceNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {

		String nameMessage = messageSource.getMessage(exception.getName(), null, exception.getName(), locale);
		String errorMessage = messageSource.getMessage(INSTANCE_NOT_FOUND_EXCEPTION_CODE,
				new Object[] { nameMessage, exception.getKey().toString() }, INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ApiResponse(
        responseCode = "400",
        description = "Recurso duplicado (DuplicateInstanceException). Devuelve un mensaje global.",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ErrorsDto.class),
            examples = @ExampleObject(
                name = "Duplicado",
                value = """
                {
                  "globalError": "Ya existe el usuario con email test@email.com"
                }
                """
            )
        )
    )
	@ExceptionHandler(DuplicateInstanceException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorsDto handleDuplicateInstanceException(DuplicateInstanceException exception, Locale locale) {

		String nameMessage = messageSource.getMessage(exception.getName(), null, exception.getName(), locale);
		String errorMessage = messageSource.getMessage(DUPLICATE_INSTANCE_EXCEPTION_CODE,
				new Object[] { nameMessage, exception.getKey().toString() }, DUPLICATE_INSTANCE_EXCEPTION_CODE, locale);

		return new ErrorsDto(errorMessage);

	}

	@ApiResponse(
        responseCode = "400",
        description = "Error de validación de parámetros (Bean Validation en @RequestParam/@PathVariable). Devuelve una lista de errores por campo/parámetro.",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ErrorsDto.class),
            examples = @ExampleObject(
                name = "Errores en parámetros",
                value = """
                {
                  "fieldErrors": [
                    { "field": "userId", "message": "debe ser mayor que 0" }
                  ]
                }
                """
            )
        )
    )
	@ExceptionHandler(HandlerMethodValidationException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorsDto handleParams(HandlerMethodValidationException ex) {
		var fieldErrors = new java.util.ArrayList<FieldErrorDto>();

		ex.getAllValidationResults().forEach(result -> {
			var mp = result.getMethodParameter();

			String paramName = mp.getParameterName() != null
					? mp.getParameterName()
					: "arg" + mp.getParameterIndex();

			result.getResolvableErrors().forEach(err -> {
				if (err instanceof FieldError fe) {
					fieldErrors.add(new FieldErrorDto(fe.getField(), fe.getDefaultMessage()));
				} else {
					fieldErrors.add(new FieldErrorDto(paramName, err.getDefaultMessage()));
				}
			});
		});

		return new ErrorsDto(fieldErrors);
	}


}
