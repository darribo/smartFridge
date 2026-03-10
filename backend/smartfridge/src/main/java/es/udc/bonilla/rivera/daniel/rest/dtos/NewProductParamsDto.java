package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
    name = "NewProductParams",
    description = "Parámetros necesarios para crear un producto"
)
public class NewProductParamsDto {

    @Schema(description = "Código de barras del producto (único en el sistema)", example = "8437015942011", nullable = true)
    private String barcode;

    @Schema(description = "Nombre del producto", example = "Leche Entera", minLength = 1, maxLength = 30)
    private String name;

    @Schema(description = "Marca del producto", example = "Marca Blanca", nullable = true)
    private String brand;

    @Schema(description = "Precio por defecto del producto", example = "1.55", nullable = true)
    private String defaultPrice;

    @Schema(description = "Imagen del producto", example = "https://example.com/milk.png", nullable = true)
    private String image;

    @Schema(description = "Cantidad del producto (0.00 - 99999.99)", example = "1.00", nullable = true)
    private String quantity;

    @Schema(description = "Unidad de medida", example = "L", allowableValues = { "G", "KG", "ML", "L", "UNIT" })
    private Product.Unit unit;

    @Schema(description = "Indica si el producto es vegetariano", example = "true")
    private Boolean isVegetarian;

    @Schema(description = "Indica si el producto es vegano", example = "false")
    private Boolean isVegan;

    @Schema(description = "Nutri-Score del producto", example = "B", nullable = true, allowableValues = { "A", "B", "C", "D", "E" })
    private Product.NutriScoreGrade nutriScoreGrade;

    @Schema(description = "Grupo NOVA del producto", example = "GROUP_1", nullable = true, allowableValues = { "GROUP_1", "GROUP_2", "GROUP_3", "GROUP_4" })
    private Product.NovaGroup novaGroup;

    @Schema(description = "Identificador del hogar al que se añadirá el producto", example = "10")
    private Long householdId;

    public NewProductParamsDto() {
    }

    public NewProductParamsDto(String barcode, String name, String brand, String defaultPrice, String image, String quantity,
            Product.Unit unit, Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Long householdId) {
        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.defaultPrice = defaultPrice;
        this.image = image;
        this.quantity = quantity;
        this.unit = unit;
        this.isVegetarian = isVegetarian;
        this.isVegan = isVegan;
        this.nutriScoreGrade = nutriScoreGrade;
        this.novaGroup = novaGroup;
        this.householdId = householdId;
    }

    @Size(max = 13)
    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    @NotNull
    @Size(min = 1, max = 30)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Size(max = 50)
    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "999.99")
    public String getDefaultPrice() {
        return defaultPrice;
    }

    public void setDefaultPrice(String defaultPrice) {
        this.defaultPrice = defaultPrice;
    }

    @Size(max = 255)
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    @NotNull
    @DecimalMin(value = "0.00")
    @DecimalMax(value = "99999.99")
    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    @NotNull
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

    @NotNull
    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }
}
