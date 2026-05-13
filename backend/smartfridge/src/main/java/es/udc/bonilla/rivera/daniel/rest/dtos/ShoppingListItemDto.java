package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class ShoppingListItemDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String customProductName;
    private String customProductBrand;
    private Integer itemCount;
    private boolean checked;
    private boolean autoAdded;
    private String checkedByName;
    private LocalDateTime checkedAt;
    private List<String> addedByNames;

    public ShoppingListItemDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public String getCustomProductName() { return customProductName; }
    public void setCustomProductName(String customProductName) { this.customProductName = customProductName; }

    public String getCustomProductBrand() { return customProductBrand; }
    public void setCustomProductBrand(String customProductBrand) { this.customProductBrand = customProductBrand; }

    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }

    public boolean isChecked() { return checked; }
    public void setChecked(boolean checked) { this.checked = checked; }

    public boolean isAutoAdded() { return autoAdded; }
    public void setAutoAdded(boolean autoAdded) { this.autoAdded = autoAdded; }

    public String getCheckedByName() { return checkedByName; }
    public void setCheckedByName(String checkedByName) { this.checkedByName = checkedByName; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }

    public List<String> getAddedByNames() { return addedByNames; }
    public void setAddedByNames(List<String> addedByNames) { this.addedByNames = addedByNames; }
}
