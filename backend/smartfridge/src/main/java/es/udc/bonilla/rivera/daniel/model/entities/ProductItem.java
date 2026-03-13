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
public class ProductItem {

    public enum StorageLocation {
        PANTRY,
        FRIDGE,
        FREEZER
    }

    private Long id;
    private Product product;
    private LocalDateTime purchaseDate;
    private LocalDateTime expirationDate;
    private BigDecimal pricePaid;
    private StorageLocation storageLocation;

    public ProductItem() {}

    public ProductItem(Product product, LocalDateTime purchaseDate, LocalDateTime expirationDate, BigDecimal pricePaid,
            StorageLocation storageLocation) {
        this.product = product;
        this.purchaseDate = purchaseDate;
        this.expirationDate = expirationDate;
        this.pricePaid = pricePaid;
        this.storageLocation = storageLocation;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="productId")
    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public BigDecimal getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(BigDecimal pricePaid) {
        this.pricePaid = pricePaid;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public StorageLocation getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(StorageLocation storageLocation) {
        this.storageLocation = storageLocation;
    }

}
