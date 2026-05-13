package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class CustomItemMatchesCatalogProductException extends Exception {

    public CustomItemMatchesCatalogProductException() {
        super("A registered product with that name already exists in this household");
    }
}
