package es.udc.bonilla.rivera.daniel.model.services.exceptions;

public class IncorrectLoginException extends Exception {

    private final String userName;
    private final String password;

    public IncorrectLoginException(String userName, String password) {
        this.userName = userName;
		this.password = password;
    }

    public String getUserName() {
        return userName;
    }

    public String getPassword() {
        return password;
    }

}
