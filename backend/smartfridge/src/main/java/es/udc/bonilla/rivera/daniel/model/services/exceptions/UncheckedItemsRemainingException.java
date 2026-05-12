package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class UncheckedItemsRemainingException extends Exception {

    private final long uncheckedCount;

    public UncheckedItemsRemainingException(long uncheckedCount) {
        super("Shopping list has unchecked items remaining: " + uncheckedCount);
        this.uncheckedCount = uncheckedCount;
    }

    public long getUncheckedCount() {
        return uncheckedCount;
    }
}
