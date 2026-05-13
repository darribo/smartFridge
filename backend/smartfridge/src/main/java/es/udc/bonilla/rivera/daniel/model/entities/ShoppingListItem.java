package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;

@Entity
public class ShoppingListItem {

    private Long id;
    private ShoppingList shoppingList;
    private Product product;
    private String customProductName;
    private String customProductBrand;
    private Integer itemCount;
    private boolean checked;
    private boolean autoAdded;
    private User checkedBy;
    private LocalDateTime checkedAt;
    private Long version;

    public ShoppingListItem() {}

    public ShoppingListItem(ShoppingList shoppingList, Product product, String customProductName,
            String customProductBrand, Integer itemCount, boolean autoAdded) {
        this.shoppingList = shoppingList;
        this.product = product;
        this.customProductName = customProductName;
        this.customProductBrand = customProductBrand;
        this.itemCount = itemCount;
        this.autoAdded = autoAdded;
        this.checked = false;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "shoppingListId")
    public ShoppingList getShoppingList() { return shoppingList; }
    public void setShoppingList(ShoppingList shoppingList) { this.shoppingList = shoppingList; }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productId")
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    @Column(length = 80)
    public String getCustomProductName() { return customProductName; }
    public void setCustomProductName(String customProductName) { this.customProductName = customProductName; }

    @Column(length = 80)
    public String getCustomProductBrand() { return customProductBrand; }
    public void setCustomProductBrand(String customProductBrand) { this.customProductBrand = customProductBrand; }

    public Integer getItemCount() { return itemCount; }
    public void setItemCount(Integer itemCount) { this.itemCount = itemCount; }

    @Column(nullable = false)
    public boolean isChecked() { return checked; }
    public void setChecked(boolean checked) { this.checked = checked; }

    @Column(nullable = false)
    public boolean isAutoAdded() { return autoAdded; }
    public void setAutoAdded(boolean autoAdded) { this.autoAdded = autoAdded; }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checkedBy")
    public User getCheckedBy() { return checkedBy; }
    public void setCheckedBy(User checkedBy) { this.checkedBy = checkedBy; }

    public LocalDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(LocalDateTime checkedAt) { this.checkedAt = checkedAt; }

    @Version
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
