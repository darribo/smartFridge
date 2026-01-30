package es.udc.bonilla.rivera.daniel.model.common;

public class InstanceNotFoundException extends InstanceException{

    public InstanceNotFoundException(String name, Object key) {
        super(name, key);
    }

}
