package es.udc.bonilla.rivera.daniel.rest.common;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "FieldError",
    description = "Error de validación asociado a un campo concreto de la petición"
)
public class FieldErrorDto {

    @Schema(
        description = "Nombre del campo que contiene el error",
        example = "email"
    )
    private String fieldName;

    @Schema(
        description = "Mensaje de error legible para el usuario",
        example = "Formato de email inválido"
    )
    private String message;


    public FieldErrorDto(String fieldName, String message) {
        this.fieldName = fieldName;
        this.message = message;
    }

    public String getFieldName() {
        return fieldName;
    }
    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

}
