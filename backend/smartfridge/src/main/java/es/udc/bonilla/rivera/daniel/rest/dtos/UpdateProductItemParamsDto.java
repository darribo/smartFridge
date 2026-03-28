package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public class UpdateProductItemParamsDto {

    private String expirationDate;
    private String pricePaid;
    private ProductItem.StorageLocation storageLocation;

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
}
