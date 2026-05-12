package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.math.BigDecimal;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import jakarta.validation.constraints.Size;

public class AddShoppingListItemParamsDto {

    private Long productId;

    @Size(max = 80)
    private String customProductName;

    @Size(max = 80)
    private String customProductBrand;

    private BigDecimal quantity;
    private Product.Unit unit;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getCustomProductName() { return customProductName; }
    public void setCustomProductName(String customProductName) { this.customProductName = customProductName; }

    public String getCustomProductBrand() { return customProductBrand; }
    public void setCustomProductBrand(String customProductBrand) { this.customProductBrand = customProductBrand; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public Product.Unit getUnit() { return unit; }
    public void setUnit(Product.Unit unit) { this.unit = unit; }
}
