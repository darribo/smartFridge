/* package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(
    name = "SendHouseholdInvitationParams",
    description = "Parámetros para enviar una invitación a un hogar"
)
public class SendHouseholdInvitationParamsDto {

    @Schema(description = "Identificador del usuario invitado", example = "2")
    private Long guestId;

    public SendHouseholdInvitationParamsDto() {}

    public SendHouseholdInvitationParamsDto(Long guestId) {
        this.guestId = guestId;
    }

    @NotNull
    public Long getGuestId() {
        return guestId;
    }

    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }

}
 */