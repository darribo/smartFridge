package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class ConsumeProductItemParamsDto {

    @NotNull
    private String quantity;

    public ConsumeProductItemParamsDto() {}

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

}
