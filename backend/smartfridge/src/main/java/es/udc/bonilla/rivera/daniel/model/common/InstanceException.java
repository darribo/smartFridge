package es.udc.bonilla.rivera.daniel.model.common;

public abstract class InstanceException extends Exception {

	private final String name;
	private final transient Object key;

	/**
	 * Instancia una nueva excepcion de instancia.
	 *
	 * @param name el nombre
	 * @param key  el id
	 */
	protected InstanceException(String name, Object key) {
		this.name = name;
		this.key = key;
	}

	public String getName() {
		return name;
	}

	public Object getKey() {
		return key;
	}

}
