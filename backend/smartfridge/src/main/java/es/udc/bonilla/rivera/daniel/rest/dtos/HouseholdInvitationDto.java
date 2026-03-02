/* package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "HouseholdInvitation",
    description = "Información de una invitación a un hogar"
)
public class HouseholdInvitationDto {

    @Schema(description = "Identificador de la invitación", example = "77")
    private Long id;
    @Schema(description = "Identificador del hogar al que se invita", example = "10")
    private Long householdId;
    @Schema(description = "Identificador del usuario anfitrión", example = "1")
    private Long hostId;
    @Schema(description = "Identificador del usuario invitado", example = "2")
    private Long guestId;
    private String guestEmail;
    @Schema(description = "Fecha y hora de envío de la invitación", example = "2026-02-17T12:00:00")
    private LocalDateTime sendingDate;
    @Schema(description = "Fecha y hora de respuesta de la invitación", example = "2026-02-17T12:30:00", nullable = true)
    private LocalDateTime responseDate;
    @Schema(description = "Estado de la invitación", example = "PENDING")
    private String status;


    public HouseholdInvitationDto() {}

    public HouseholdInvitationDto(Long id, Long householdId, Long hostId, Long guestId, String guestEmail, LocalDateTime sendingDate,
            LocalDateTime responseDate, String status) {
        this.id = id;
        this.householdId = householdId;
        this.hostId = hostId;
        this.guestId = guestId;
        this.guestEmail = guestEmail;
        this.sendingDate = sendingDate;
        this.responseDate = responseDate;
        this.status = status;
    }


    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Long getHouseholdId() {
        return householdId;
    }
    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public Long getHostId() {
        return hostId;
    }
    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }

    public Long getGuestId() {
        return guestId;
    }
    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }

    public String getGuestEmail() {
        return guestEmail;
    }
    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public LocalDateTime getSendingDate() {
        return sendingDate;
    }
    public void setSendingDate(LocalDateTime sendingDate) {
        this.sendingDate = sendingDate;
    }

    public LocalDateTime getResponseDate() {
        return responseDate;
    }
    public void setResponseDate(LocalDateTime responseDate) {
        this.responseDate = responseDate;
    }
    
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

}
 */