package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class NoAvailableProductsException extends Exception {

    public NoAvailableProductsException() {
        super("No available products for recipe generation");
    }

}
