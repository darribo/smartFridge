package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
    name = "NewHouseholdParams",
    description = "Parámetros necesarios para crear o actualizar un hogar"
)
public class NewHouseholdParamsDto {

    @Schema(description = "Nombre del hogar", example = "Casa principal", minLength = 1, maxLength = 30)
    private String name;
    @Schema(description = "Descripción del hogar", example = "Hogar familiar", maxLength = 500, nullable = true)
    private String description;
    @Schema(description = "Código de país del hogar", example = "ES", minLength = 1, maxLength = 10)
    private String countryCode;
    @Schema(description = "Código de región del hogar", example = "GA", minLength = 1, maxLength = 10)
    private String regionCode;
    @Schema(description = "Nombre de la región del hogar", example = "Galicia", minLength = 1, maxLength = 100)
    private String regionName;

    public NewHouseholdParamsDto() {}

    public NewHouseholdParamsDto(String name, String description, String countryCode, String regionCode,
            String regionName) {
        this.name = name;
        this.description = description;
        this.countryCode = countryCode;
        this.regionCode = regionCode;
        this.regionName = regionName;
    }

    @NotNull
    @Size(min=1, max=30)
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    
    @Size(max=500)
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    @NotNull
    @Size(min=1, max=10)
    public String getCountryCode() {
        return countryCode;
    }
    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    @NotNull
    @Size(min=1, max=10)
    public String getRegionCode() {
        return regionCode;
    }
    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    @NotNull
    @Size(min=1, max=100)
    public String getRegionName() {
        return regionName;
    }
    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

}
