package es.udc.bonilla.rivera.daniel.model.services.exceptions;

import java.util.List;

public class InsufficientStockException extends Exception {

    private final List<String> insufficientIngredientNames;

    public InsufficientStockException(List<String> insufficientIngredientNames) {
        this.insufficientIngredientNames = insufficientIngredientNames;
    }

    public List<String> getInsufficientIngredientNames() {
        return insufficientIngredientNames;
    }

}
