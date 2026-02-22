package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(
    name = "ChangeAdminParams",
    description = "Parámetros para cambiar el administrador de un hogar"
)
public class ChangeAdminParamsDto {

    @Schema(description = "Identificador del nuevo administrador del hogar", example = "3")
    private Long newAdminId;

    public ChangeAdminParamsDto() {}

    public ChangeAdminParamsDto(Long newAdminId) {
        this.newAdminId = newAdminId;
    }

    @NotNull
    public Long getNewAdminId() {
        return newAdminId;
    }

    public void setNewAdminId(Long newAdminId) {
        this.newAdminId = newAdminId;
    }

}
