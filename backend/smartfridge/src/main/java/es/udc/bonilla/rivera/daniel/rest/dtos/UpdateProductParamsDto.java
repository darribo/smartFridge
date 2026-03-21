package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;
import es.udc.bonilla.rivera.daniel.model.entities.Product;

public class UpdateProductParamsDto {

    private String name;
    private String brand;
    private String defaultPrice;
    private String quantity;
    private Product.Unit unit;
    private Boolean isVegetarian;
    private Boolean isVegan;
    private Product.NutriScoreGrade nutriScoreGrade;
    private Product.NovaGroup novaGroup;
    private Integer daysAfterOpening;

    public UpdateProductParamsDto() {
    }

    @NotNull
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDefaultPrice() {
        return defaultPrice;
    }

    public void setDefaultPrice(String defaultPrice) {
        this.defaultPrice = defaultPrice;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public Product.Unit getUnit() {
        return unit;
    }

    public void setUnit(Product.Unit unit) {
        this.unit = unit;
    }

    public Boolean getIsVegetarian() {
        return isVegetarian;
    }

    public void setIsVegetarian(Boolean isVegetarian) {
        this.isVegetarian = isVegetarian;
    }

    public Boolean getIsVegan() {
        return isVegan;
    }

    public void setIsVegan(Boolean isVegan) {
        this.isVegan = isVegan;
    }

    public Product.NutriScoreGrade getNutriScoreGrade() {
        return nutriScoreGrade;
    }

    public void setNutriScoreGrade(Product.NutriScoreGrade nutriScoreGrade) {
        this.nutriScoreGrade = nutriScoreGrade;
    }

    public Product.NovaGroup getNovaGroup() {
        return novaGroup;
    }

    public void setNovaGroup(Product.NovaGroup novaGroup) {
        this.novaGroup = novaGroup;
    }

    public Integer getDaysAfterOpening() {
        return daysAfterOpening;
    }

    public void setDaysAfterOpening(Integer daysAfterOpening) {
        this.daysAfterOpening = daysAfterOpening;
    }
}
