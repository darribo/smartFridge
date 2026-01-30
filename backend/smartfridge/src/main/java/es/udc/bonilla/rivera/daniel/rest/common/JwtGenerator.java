package es.udc.bonilla.rivera.daniel.rest.common;

public interface JwtGenerator {

    /**
     * Genera un token JWT de acceso basado en la información proporcionada.
     * 
     * Este método crea un token de autenticación que será utilizado para autorizar
     * las peticiones posteriores del usuario autenticado.
     *
     * @param info Objeto que contiene la información necesaria para generar el token
     *             (como identificador de usuario, roles, etc.)
     * @return Una cadena de caracteres que representa el token JWT de acceso generado
     */
    String generateAccessToken(JwtInfo info);

    /**
     * Extrae la información contenida en un token de acceso JWT.
     *
     * @param token el token JWT del que se desea obtener la información.
     * @return un objeto {@link JwtInfo} que contiene los datos extraídos del token.
     * @throws JwtException si el token es inválido o no se puede procesar.
     */
    JwtInfo getInfoFromAccessToken(String token);

}
