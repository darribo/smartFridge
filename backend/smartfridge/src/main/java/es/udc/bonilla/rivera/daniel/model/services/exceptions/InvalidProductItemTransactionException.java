package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class InvalidProductItemTransactionException extends Exception {

    public static final String ALREADY_CREATED =
            "project.exceptions.InvalidProductItemTransactionException.alreadyCreated";
    public static final String ITEM_NOT_OPERABLE =
            "project.exceptions.InvalidProductItemTransactionException.itemNotOperable";
    public static final String ALREADY_OPENED =
            "project.exceptions.InvalidProductItemTransactionException.alreadyOpened";
    public static final String ALREADY_DISCARDED =
            "project.exceptions.InvalidProductItemTransactionException.alreadyDiscarded";
    public static final String CONSUME_EXCEEDS_REMAINING =
            "project.exceptions.InvalidProductItemTransactionException.consumeExceedsRemaining";

    private final String errorCode;

    public InvalidProductItemTransactionException(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

}
