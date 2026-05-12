package es.udc.bonilla.rivera.daniel.model.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    private BigDecimal quantity;
    private Product.Unit unit;
    private boolean checked;
    private boolean autoAdded;
    private User checkedBy;
    private LocalDateTime checkedAt;
    private Long version;

    public ShoppingListItem() {}

    public ShoppingListItem(ShoppingList shoppingList, Product product, String customProductName,
            String customProductBrand, BigDecimal quantity, Product.Unit unit, boolean autoAdded) {
        this.shoppingList = shoppingList;
        this.product = product;
        this.customProductName = customProductName;
        this.customProductBrand = customProductBrand;
        this.quantity = quantity;
        this.unit = unit;
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

    @Column(precision = 7, scale = 2)
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    @Enumerated(EnumType.ORDINAL)
    public Product.Unit getUnit() { return unit; }
    public void setUnit(Product.Unit unit) { this.unit = unit; }

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
