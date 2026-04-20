package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class DietaryConflictException extends Exception {

    public enum ConflictType {
        VEGETARIAN,
        VEGAN
    }

    private final ConflictType conflictType;
    private final String productName;

    public DietaryConflictException(ConflictType conflictType, String productName) {
        this.conflictType = conflictType;
        this.productName = productName;
    }

    public ConflictType getConflictType() {
        return conflictType;
    }

    public String getProductName() {
        return productName;
    }

}
