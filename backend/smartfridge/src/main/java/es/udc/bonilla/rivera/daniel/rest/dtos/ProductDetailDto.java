package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "ProductDetail",
    description = "Información completa de un producto junto con todos sus items"
)
public class ProductDetailDto {

    private Long id;
    private String barcode;
    private String name;
    private String brand;
    private String defaultPrice;
    private String image;
    private String quantity;
    private Product.Unit unit;
    private boolean isVegetarian;
    private boolean isVegan;
    private Product.NutriScoreGrade nutriScoreGrade;
    private Product.NovaGroup novaGroup;
    private LocalDateTime createdAt;
    private Integer daysAfterOpening;
    private List<ProductItemDto> items;
    private Long version;

    public ProductDetailDto() {
    }

    public ProductDetailDto(Long id, String barcode, String name, String brand, String defaultPrice,
            String image, String quantity, Product.Unit unit, boolean isVegetarian, boolean isVegan,
            Product.NutriScoreGrade nutriScoreGrade, Product.NovaGroup novaGroup,
            LocalDateTime createdAt, Integer daysAfterOpening, List<ProductItemDto> items, Long version) {
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
        this.daysAfterOpening = daysAfterOpening;
        this.items = items;
        this.version = version;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getDefaultPrice() { return defaultPrice; }
    public void setDefaultPrice(String defaultPrice) { this.defaultPrice = defaultPrice; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public Product.Unit getUnit() { return unit; }
    public void setUnit(Product.Unit unit) { this.unit = unit; }

    public boolean isVegetarian() { return isVegetarian; }
    public void setVegetarian(boolean isVegetarian) { this.isVegetarian = isVegetarian; }

    public boolean isVegan() { return isVegan; }
    public void setVegan(boolean isVegan) { this.isVegan = isVegan; }

    public Product.NutriScoreGrade getNutriScoreGrade() { return nutriScoreGrade; }
    public void setNutriScoreGrade(Product.NutriScoreGrade nutriScoreGrade) { this.nutriScoreGrade = nutriScoreGrade; }

    public Product.NovaGroup getNovaGroup() { return novaGroup; }
    public void setNovaGroup(Product.NovaGroup novaGroup) { this.novaGroup = novaGroup; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Integer getDaysAfterOpening() { return daysAfterOpening; }
    public void setDaysAfterOpening(Integer daysAfterOpening) { this.daysAfterOpening = daysAfterOpening; }

    public List<ProductItemDto> getItems() { return items; }
    public void setItems(List<ProductItemDto> items) { this.items = items; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
