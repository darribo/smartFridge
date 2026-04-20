package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class LlmServiceException extends Exception {

    public LlmServiceException() {
        super("LLM service unavailable");
    }

    public LlmServiceException(String message) {
        super(message);
    }

}
