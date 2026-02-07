package es.udc.bonilla.rivera.daniel.rest.common;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "Errors",
    description = "Respuesta estándar de error de la API. Puede contener un error global o una lista de errores de validación por campo."
)
public class ErrorsDto {

    @Schema(
        description = "Mensaje de error global no asociado a un campo concreto",
        example = "No existe el usuario con id 42"
    )
    private String globalError;

    @Schema(
        description = "Lista de errores de validación asociados a campos concretos de la petición"
    )
    private List<FieldErrorDto> fieldErrors;

    public ErrorsDto(String globalError) {
        this.globalError = globalError;
    }

    public ErrorsDto(List<FieldErrorDto> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    public String getGlobalError() {
        return globalError;
    }
    public void setGlobalError(String globalError) {
        this.globalError = globalError;
    }

    public List<FieldErrorDto> getFieldErrors() {
        return fieldErrors;
    }
    public void setFieldErrors(List<FieldErrorDto> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

}