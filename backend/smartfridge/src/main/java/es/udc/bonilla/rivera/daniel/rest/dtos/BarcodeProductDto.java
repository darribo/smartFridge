package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "BarcodeProduct",
    description = "Información de producto obtenida por código de barras (local o externa)"
)
public class BarcodeProductDto {

    @Schema(description = "Identificador del producto en la base de datos local", example = "20", nullable = true)
    private Long id;

    @Schema(description = "Código de barras del producto", example = "8437015942011")
    private String barcode;

    @Schema(description = "Nombre del producto", example = "Leche Entera")
    private String name;

    @Schema(description = "Marca del producto", example = "Marca Blanca", nullable = true)
    private String brand;

    @Schema(description = "Precio por defecto del producto", example = "1.55", nullable = true)
    private String defaultPrice;

    @Schema(description = "Imagen del producto", example = "https://example.com/milk.png", nullable = true)
    private String image;

    @Schema(description = "Cantidad del producto", example = "1.00", nullable = true)
    private String quantity;

    @Schema(description = "Unidad de medida", example = "L", nullable = true)
    private Product.Unit unit;

    @Schema(description = "Indica si el producto es vegetariano", example = "true", nullable = true)
    private Boolean vegetarian;

    @Schema(description = "Indica si el producto es vegano", example = "false", nullable = true)
    private Boolean vegan;

    @Schema(description = "Nutri-Score del producto", example = "B", nullable = true)
    private Product.NutriScoreGrade nutriScoreGrade;

    @Schema(description = "Grupo NOVA del producto", example = "GROUP_1", nullable = true)
    private Product.NovaGroup novaGroup;

    public BarcodeProductDto() {
    }

    public BarcodeProductDto(Long id, String barcode, String name, String brand, String defaultPrice, String image,
            String quantity, Product.Unit unit, Boolean vegetarian, Boolean vegan,
            Product.NutriScoreGrade nutriScoreGrade, Product.NovaGroup novaGroup) {
        this.id = id;
        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.defaultPrice = defaultPrice;
        this.image = image;
        this.quantity = quantity;
        this.unit = unit;
        this.vegetarian = vegetarian;
        this.vegan = vegan;
        this.nutriScoreGrade = nutriScoreGrade;
        this.novaGroup = novaGroup;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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

    public Boolean getVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(Boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public Boolean getVegan() {
        return vegan;
    }

    public void setVegan(Boolean vegan) {
        this.vegan = vegan;
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
}
