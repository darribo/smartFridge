package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateHouseholdParamsDto {

    private String name;
    private String description;
    private String countryCode;
    private String regionCode;
    private String regionName;
    private Long version;

    public UpdateHouseholdParamsDto() {}

    @NotNull
    @Size(min = 1, max = 30)
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    @Size(max = 500)
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    @NotNull
    @Size(min = 1, max = 10)
    public String getCountryCode() {
        return countryCode;
    }
    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    @NotNull
    @Size(min = 1, max = 10)
    public String getRegionCode() {
        return regionCode;
    }
    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    @NotNull
    @Size(min = 1, max = 100)
    public String getRegionName() {
        return regionName;
    }
    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    @NotNull
    public Long getVersion() {
        return version;
    }
    public void setVersion(Long version) {
        this.version = version;
    }
}
