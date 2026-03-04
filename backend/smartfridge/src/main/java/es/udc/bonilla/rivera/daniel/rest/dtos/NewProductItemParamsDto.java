package es.udc.bonilla.rivera.daniel.rest.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
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

    public NewProductItemParamsDto() {
    }

    public NewProductItemParamsDto(String purchaseDate, String expirationDate, String pricePaid) {
        this.purchaseDate = purchaseDate;
        this.expirationDate = expirationDate;
        this.pricePaid = pricePaid;
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

    public String getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(String pricePaid) {
        this.pricePaid = pricePaid;
    }
}
