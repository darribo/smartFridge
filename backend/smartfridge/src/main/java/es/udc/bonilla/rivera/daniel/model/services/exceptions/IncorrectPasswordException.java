package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class IncorrectPasswordException extends Exception {

    public IncorrectPasswordException() {
        super("Incorrect current password");
    }

}
