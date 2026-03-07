package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "Product",
    description = "Información de un producto"
)
public class ProductDto {

    @Schema(description = "Identificador único del producto", example = "20")
    private Long id;

    @Schema(description = "Código de barras del producto", example = "8437015942011", nullable = true)
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

    @Schema(description = "Unidad del producto", example = "L")
    private Product.Unit unit;

    @Schema(description = "Indica si el producto es vegetariano", example = "true")
    private boolean isVegetarian;

    @Schema(description = "Indica si el producto es vegano", example = "false")
    private boolean isVegan;

    @Schema(description = "Nutri-Score del producto", example = "B", nullable = true)
    private Product.NutriScoreGrade nutriScoreGrade;

    @Schema(description = "Grupo NOVA del producto", example = "GROUP_1", nullable = true)
    private Product.NovaGroup novaGroup;

    @Schema(description = "Fecha de creación del producto", example = "2026-03-02T14:15:00")
    private LocalDateTime createdAt;

    public ProductDto() {
    }

    public ProductDto(Long id, String barcode, String name, String brand, String defaultPrice, String image, String quantity,
            Product.Unit unit, boolean isVegetarian, boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, LocalDateTime createdAt) {
        this.id = id;
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
        this.createdAt = createdAt;
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

    public boolean isVegetarian() {
        return isVegetarian;
    }

    public void setVegetarian(boolean isVegetarian) {
        this.isVegetarian = isVegetarian;
    }

    public boolean isVegan() {
        return isVegan;
    }

    public void setVegan(boolean isVegan) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
