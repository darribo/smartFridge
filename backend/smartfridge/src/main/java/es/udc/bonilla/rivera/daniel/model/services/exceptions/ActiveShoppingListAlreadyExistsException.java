package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class ActiveShoppingListAlreadyExistsException extends Exception {

    public ActiveShoppingListAlreadyExistsException() {
        super("An active shopping list already exists for this household");
    }
}
