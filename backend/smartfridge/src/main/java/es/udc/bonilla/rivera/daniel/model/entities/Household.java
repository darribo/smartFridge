package es.udc.bonilla.rivera.daniel.model.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;

@Entity
public class Household {

    private Long id;
    private String name;
    private String description;
    private String countryCode;
    private String regionCode;
    private String regionName;
    private User admin;
    private Long version;

    public Household() {}

    public Household(String name, String description, String countryCode, String regionCode, String regionName, User admin) {
        this.name = name;
        this.description = description;
        this.countryCode = countryCode;
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.admin = admin;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    public User getAdmin(){
        return admin;
    }
    public void setAdmin(User admin) {
        this.admin = admin;
    }

    @Version
    public Long getVersion() {
        return version;
    }
    public void setVersion(Long version) {
        this.version = version;
    }
}
