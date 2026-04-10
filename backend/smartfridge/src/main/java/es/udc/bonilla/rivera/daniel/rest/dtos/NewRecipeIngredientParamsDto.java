package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "NewRecipeIngredientParams", description = "Parámetros para un ingrediente de receta")
public class NewRecipeIngredientParamsDto {

    @Schema(description = "Nombre del ingrediente", example = "Harina de trigo")
    private String name;

    @Schema(description = "Cantidad", example = "250.00", nullable = true)
    private String quantityValue;

    @Schema(description = "Unidad de medida", example = "G", nullable = true)
    private RecipeIngredient.IngredientUnit unit;

    @Schema(description = "Notas adicionales sobre el ingrediente", example = "Tamizada", nullable = true)
    private String notes;

    @Schema(description = "Indica si el ingrediente es opcional", example = "false")
    private Boolean optionalIngredient;

    @Schema(description = "Orden de visualización en la lista", example = "1")
    private Integer displayOrder;

    @Schema(description = "ID del producto vinculado del hogar", example = "42", nullable = true)
    private Long productId;

    public NewRecipeIngredientParamsDto() {}

    @NotNull
    @Size(max = 100)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @DecimalMin(value = "0.00")
    @DecimalMax(value = "99999.99")
    public String getQuantityValue() {
        return quantityValue;
    }

    public void setQuantityValue(String quantityValue) {
        this.quantityValue = quantityValue;
    }

    public RecipeIngredient.IngredientUnit getUnit() {
        return unit;
    }

    public void setUnit(RecipeIngredient.IngredientUnit unit) {
        this.unit = unit;
    }

    @Size(max = 255)
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getOptionalIngredient() {
        return optionalIngredient;
    }

    public void setOptionalIngredient(Boolean optionalIngredient) {
        this.optionalIngredient = optionalIngredient;
    }

    @NotNull
    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

}
