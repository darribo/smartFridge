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

@Entity
public class ProductItemTransaction {

    public enum TransactionType {
        CREATE,
        OPEN,
        CONSUME,
        ADJUST,
        DISCARD
    }

    private Long id;
    private ProductItem productItem;
    private User user;
    private TransactionType type;
    private BigDecimal quantityDeltaValue;
    private LocalDateTime createdAt;
    private CookedRecipe cookedRecipe;

    public ProductItemTransaction() {}

    public ProductItemTransaction(ProductItem productItem, User user, TransactionType type, BigDecimal quantityDeltaValue,
            LocalDateTime createdAt) {
        this.productItem = productItem;
        this.user = user;
        this.type = type;
        this.quantityDeltaValue = quantityDeltaValue;
        this.createdAt = createdAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "productItemId")
    public ProductItem getProductItem() {
        return productItem;
    }

    public void setProductItem(ProductItem productItem) {
        this.productItem = productItem;
    }

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    @Column(precision = 7, scale = 2)
    public BigDecimal getQuantityDeltaValue() {
        return quantityDeltaValue;
    }

    public void setQuantityDeltaValue(BigDecimal quantityDeltaValue) {
        this.quantityDeltaValue = quantityDeltaValue;
    }

    @Column(nullable = false)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "cookedRecipeId")
    public CookedRecipe getCookedRecipe() {
        return cookedRecipe;
    }

    public void setCookedRecipe(CookedRecipe cookedRecipe) {
        this.cookedRecipe = cookedRecipe;
    }

}
