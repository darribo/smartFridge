package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class IngredientUnitMismatchException extends Exception {

    private final String ingredientName;
    private final String ingredientUnit;
    private final String productUnit;

    public IngredientUnitMismatchException(String ingredientName, String ingredientUnit, String productUnit) {
        this.ingredientName = ingredientName;
        this.ingredientUnit = ingredientUnit;
        this.productUnit = productUnit;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public String getIngredientUnit() {
        return ingredientUnit;
    }

    public String getProductUnit() {
        return productUnit;
    }

}
