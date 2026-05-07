package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
    name = "ProductItem",
    description = "Información de un item de producto"
)
public class ProductItemDto {

    @Schema(description = "Identificador único del item", example = "55")
    private Long id;

    @Schema(description = "Identificador del producto asociado", example = "20")
    private Long productId;

    @Schema(description = "Fecha de compra en formato ISO-8601", example = "2026-03-02T10:30:00")
    private String purchaseDate;

    @Schema(description = "Fecha de caducidad en formato ISO-8601", example = "2026-03-10T10:30:00", nullable = true)
    private String expirationDate;

    @Schema(description = "Precio pagado por el item", example = "2.45", nullable = true)
    private String pricePaid;

    @Schema(description = "Ubicación de la casa donde se guarda el item", example = "FRIDGE")
    private ProductItem.StorageLocation storageLocation;

    @Schema(description = "Fecha en la que se abrió el item", example = "2026-03-10T08:00:00", nullable = true)
    private String openedAt;

    @Schema(description = "Cantidad inicial del item al añadirlo", example = "1.00", nullable = true)
    private String initialQuantityValue;

    @Schema(description = "Cantidad restante del item", example = "0.50", nullable = true)
    private String quantityRemainingValue;

    @Schema(description = "Versión para control de concurrencia optimista", example = "0")
    private Long version;

    public ProductItemDto() {
    }

    public ProductItemDto(Long id, Long productId, String purchaseDate, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation, String openedAt, String initialQuantityValue,
            String quantityRemainingValue, Long version) {
        this.id = id;
        this.productId = productId;
        this.purchaseDate = purchaseDate;
        this.expirationDate = expirationDate;
        this.pricePaid = pricePaid;
        this.storageLocation = storageLocation;
        this.openedAt = openedAt;
        this.initialQuantityValue = initialQuantityValue;
        this.quantityRemainingValue = quantityRemainingValue;
        this.version = version;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

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

    public String getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(String pricePaid) {
        this.pricePaid = pricePaid;
    }

    public ProductItem.StorageLocation getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(ProductItem.StorageLocation storageLocation) {
        this.storageLocation = storageLocation;
    }

    public String getOpenedAt() {
        return openedAt;
    }

    public void setOpenedAt(String openedAt) {
        this.openedAt = openedAt;
    }

    public String getInitialQuantityValue() {
        return initialQuantityValue;
    }

    public void setInitialQuantityValue(String initialQuantityValue) {
        this.initialQuantityValue = initialQuantityValue;
    }

    public String getQuantityRemainingValue() {
        return quantityRemainingValue;
    }

    public void setQuantityRemainingValue(String quantityRemainingValue) {
        this.quantityRemainingValue = quantityRemainingValue;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
