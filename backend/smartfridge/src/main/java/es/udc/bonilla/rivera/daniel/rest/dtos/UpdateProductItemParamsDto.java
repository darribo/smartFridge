package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public class UpdateProductItemParamsDto {

    private String expirationDate;
    private String pricePaid;
    private ProductItem.StorageLocation storageLocation;
    private Long version;

    public UpdateProductItemParamsDto() {
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(String pricePaid) {
        this.pricePaid = pricePaid;
    }

    @NotNull
    public ProductItem.StorageLocation getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(ProductItem.StorageLocation storageLocation) {
        this.storageLocation = storageLocation;
    }

    @NotNull
    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
