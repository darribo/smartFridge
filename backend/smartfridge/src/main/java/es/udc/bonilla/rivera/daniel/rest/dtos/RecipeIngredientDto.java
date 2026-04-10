package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "RecipeIngredient", description = "Ingrediente de una receta")
public class RecipeIngredientDto {

    @Schema(description = "ID del ingrediente", example = "1")
    private Long id;

    @Schema(description = "Nombre del ingrediente", example = "Harina de trigo")
    private String name;

    @Schema(description = "Cantidad", example = "250.00", nullable = true)
    private String quantityValue;

    @Schema(description = "Unidad de medida", example = "G", nullable = true)
    private RecipeIngredient.IngredientUnit unit;

    @Schema(description = "Notas adicionales", nullable = true)
    private String notes;

    @Schema(description = "Indica si el ingrediente es opcional", example = "false")
    private Boolean optionalIngredient;

    @Schema(description = "Orden de visualización", example = "1")
    private Integer displayOrder;

    @Schema(description = "ID del producto vinculado", example = "42", nullable = true)
    private Long productId;

    public RecipeIngredientDto() {}

    public RecipeIngredientDto(Long id, String name, String quantityValue,
            RecipeIngredient.IngredientUnit unit, String notes,
            Boolean optionalIngredient, Integer displayOrder, Long productId) {
        this.id = id;
        this.name = name;
        this.quantityValue = quantityValue;
        this.unit = unit;
        this.notes = notes;
        this.optionalIngredient = optionalIngredient;
        this.displayOrder = displayOrder;
        this.productId = productId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getQuantityValue() { return quantityValue; }
    public void setQuantityValue(String quantityValue) { this.quantityValue = quantityValue; }

    public RecipeIngredient.IngredientUnit getUnit() { return unit; }
    public void setUnit(RecipeIngredient.IngredientUnit unit) { this.unit = unit; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Boolean getOptionalIngredient() { return optionalIngredient; }
    public void setOptionalIngredient(Boolean optionalIngredient) { this.optionalIngredient = optionalIngredient; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

}
