package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.Size;

public class AddShoppingListItemParamsDto {

    private Long productId;

    @Size(max = 80)
    private String customProductName;

    @Size(max = 80)
    private String customProductBrand;

    private Integer itemCount;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getCustomProductName() { return customProductName; }
    public void setCustomProductName(String customProductName) { this.customProductName = customProductName; }

    public String getCustomProductBrand() { return customProductBrand; }
    public void setCustomProductBrand(String customProductBrand) { this.customProductBrand = customProductBrand; }

    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }
}
