package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "ProductWithItems",
    description = "Información de un producto junto con sus items asociados"
)
public class ProductWithItemsDto {

    @Schema(description = "Identificador único del producto", example = "20")
    private Long id;

    @Schema(description = "Nombre del producto", example = "Leche Entera")
    private String name;

    @Schema(description = "Imagen del producto", example = "https://example.com/milk.png", nullable = true)
    private String image;

    @Schema(description = "Cantidad del producto", example = "1.00", nullable = true)
    private String quantity;

    @Schema(description = "Unidad del producto", example = "L")
    private Product.Unit unit;

    @Schema(description = "Número total de items asociados al producto", example = "3")
    private int countItems;

    @Schema(description = "Lista de items del producto")
    private List<ProductItemDto> items;

    public ProductWithItemsDto() {
    }

    public ProductWithItemsDto(Long id, String name, String image, String quantity, Product.Unit unit, int countItems,
            List<ProductItemDto> items) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.quantity = quantity;
        this.unit = unit;
        this.countItems = countItems;
        this.items = items;
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

    public int getCountItems() {
        return countItems;
    }

    public void setCountItems(int countItems) {
        this.countItems = countItems;
    }

    public List<ProductItemDto> getItems() {
        return items;
    }

    public void setItems(List<ProductItemDto> items) {
        this.items = items;
    }
}
