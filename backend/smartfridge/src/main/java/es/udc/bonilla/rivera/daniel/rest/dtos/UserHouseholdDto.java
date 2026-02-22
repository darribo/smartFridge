package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "UserHousehold",
    description = "Relación de pertenencia entre un usuario y un hogar"
)
public class UserHouseholdDto {

    @Schema(description = "Identificador del usuario", example = "2")
    private Long userId;
    @Schema(description = "Identificador del hogar", example = "10")
    private Long householdId;
    @Schema(description = "Fecha y hora de incorporación del usuario al hogar", example = "2026-02-17T12:10:00")
    private LocalDateTime joinedAt;

    public UserHouseholdDto() {}

    public UserHouseholdDto(Long userId, Long householdId, LocalDateTime joinedAt) {
        this.userId = userId;
        this.householdId = householdId;
        this.joinedAt = joinedAt;
    }
    
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getHouseholdId() {
        return householdId;
    }
    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

}
