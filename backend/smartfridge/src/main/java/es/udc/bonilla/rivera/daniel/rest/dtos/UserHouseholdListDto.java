package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "UserHouseholdList",
    description = "Resumen de hogar para listado de hogares del usuario"
)
public class UserHouseholdListDto {

    @Schema(description = "Identificador del hogar", example = "10")
    private Long id;
    @Schema(description = "Nombre del hogar", example = "Casa principal")
    private String name;
    @Schema(description = "Número total de miembros del hogar", example = "4")
    private int membersNumber;
    @Schema(description = "Avatares de algunos miembros del hogar")
    private List<String> membersAvatars;
    @Schema(description = "Indica si existen más miembros de los mostrados en el resumen", example = "true")
    private boolean hasMore;

    public UserHouseholdListDto() {}
    
    public UserHouseholdListDto(Long id, String name, int membersNumber, List<String> membersAvatars, boolean hasMore) {
        this.id = id;
        this.name = name;
        this.membersNumber = membersNumber;
        this.membersAvatars = membersAvatars;
        this.hasMore = hasMore;
    }
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public int getMembersNumber() {
        return membersNumber;
    }
    public void setMembersNumber(int membersNumber) {
        this.membersNumber = membersNumber;
    }

    public List<String> getMembersAvatars() {
        return membersAvatars;
    }
    public void setMembersAvatars(List<String> membersAvatars) {
        this.membersAvatars = membersAvatars;
    }

    public boolean getHasMore() {
        return hasMore;
    }

    public void setHasMore(boolean hasMore) {
        this.hasMore = hasMore;
    }

}
