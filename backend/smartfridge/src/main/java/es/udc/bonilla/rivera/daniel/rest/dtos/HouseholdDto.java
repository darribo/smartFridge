package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "Household",
    description = "Información de un hogar"
)
public class HouseholdDto {

    @Schema(description = "Identificador único del hogar", example = "10")
    private Long id;
    @Schema(description = "Nombre del hogar", example = "Casa principal")
    private String name;
    @Schema(description = "Descripción del hogar", example = "Hogar familiar")
    private String description;
    @Schema(description = "Código de país del hogar", example = "ES")
    private String countryCode;
    @Schema(description = "Código de región del hogar", example = "GA")
    private String regionCode;
    @Schema(description = "Nombre de la región del hogar", example = "Galicia")
    private String regionName;
    @Schema(description = "Identificador del usuario administrador", example = "1")
    private Long adminId;

    public HouseholdDto() {}

    public HouseholdDto(Long id, String name, String description, String countryCode, String regionCode, String regionName, Long adminId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.countryCode = countryCode;
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.adminId = adminId;
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

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountryCode() {
        return countryCode;
    }
    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getRegionCode() {
        return regionCode;
    }
    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getRegionName() {
        return regionName;
    }
    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public Long getAdminId() {
        return adminId;
    }
    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

}
