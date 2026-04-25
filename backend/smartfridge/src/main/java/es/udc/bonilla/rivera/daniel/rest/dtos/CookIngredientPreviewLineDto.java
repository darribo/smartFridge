package es.udc.bonilla.rivera.daniel.rest.dtos;

public class CookIngredientPreviewLineDto {

    private Long ingredientId;
    private String ingredientName;
    private String requiredQuantity;
    private String availableQuantity;
    private boolean sufficient;
    private boolean optional;
    private Long productId;
    private String unit;

    public CookIngredientPreviewLineDto() {}

    public CookIngredientPreviewLineDto(Long ingredientId, String ingredientName, String requiredQuantity,
            String availableQuantity, boolean sufficient, boolean optional, Long productId, String unit) {
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.requiredQuantity = requiredQuantity;
        this.availableQuantity = availableQuantity;
        this.sufficient = sufficient;
        this.optional = optional;
        this.productId = productId;
        this.unit = unit;
    }

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public String getIngredientName() { return ingredientName; }
    public void setIngredientName(String ingredientName) { this.ingredientName = ingredientName; }

    public String getRequiredQuantity() { return requiredQuantity; }
    public void setRequiredQuantity(String requiredQuantity) { this.requiredQuantity = requiredQuantity; }

    public String getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(String availableQuantity) { this.availableQuantity = availableQuantity; }

    public boolean isSufficient() { return sufficient; }
    public void setSufficient(boolean sufficient) { this.sufficient = sufficient; }

    public boolean isOptional() { return optional; }
    public void setOptional(boolean optional) { this.optional = optional; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

}
