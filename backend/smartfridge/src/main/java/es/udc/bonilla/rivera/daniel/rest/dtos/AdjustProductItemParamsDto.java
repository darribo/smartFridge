package es.udc.bonilla.rivera.daniel.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class AdjustProductItemParamsDto {

    @NotNull
    private String newQuantity;

    public AdjustProductItemParamsDto() {}

    public String getNewQuantity() { return newQuantity; }
    public void setNewQuantity(String newQuantity) { this.newQuantity = newQuantity; }

}
