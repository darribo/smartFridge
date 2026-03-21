package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Schema(
    name = "NewProductItemParams",
    description = "Parámetros necesarios para crear un item de producto"
)
public class NewProductItemParamsDto {

    @Schema(description = "Fecha de compra en formato ISO-8601", example = "2026-03-02T10:30:00")
    private String purchaseDate;

    @Schema(description = "Fecha de caducidad en formato ISO-8601", example = "2026-03-10T10:30:00", nullable = true)
    private String expirationDate;

    @Schema(description = "Precio pagado por el item", example = "2.45", nullable = true)
    private String pricePaid;

    @Schema(description = "Ubicación de la casa donde se guarda el item", example = "FRIDGE",
            allowableValues = { "PANTRY", "FRIDGE", "FREEZER" })
    private ProductItem.StorageLocation storageLocation;

    @Schema(description = "Cantidad inicial del item (por defecto la del producto)", example = "1.00", nullable = true)
    private String initialQuantityValue;

    public NewProductItemParamsDto() {
    }

    public NewProductItemParamsDto(String purchaseDate, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation, String initialQuantityValue) {
        this.purchaseDate = purchaseDate;
        this.expirationDate = expirationDate;
        this.pricePaid = pricePaid;
        this.storageLocation = storageLocation;
        this.initialQuantityValue = initialQuantityValue;
    }

    @NotNull
    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "999.99")
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

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "99999.99")
    public String getInitialQuantityValue() {
        return initialQuantityValue;
    }

    public void setInitialQuantityValue(String initialQuantityValue) {
        this.initialQuantityValue = initialQuantityValue;
    }
}
