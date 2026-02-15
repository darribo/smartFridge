package es.udc.bonilla.rivera.daniel.rest.common;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtGeneratorImpl implements JwtGenerator {

    private final Key signKey;
    private final long accessExpirationMillis;

    public JwtGeneratorImpl(
        @Value("${project.jwt.signKey}") String signKey,
        @Value("${project.jwt.accessExpirationMinutes}") long accessExpirationMinutes) {

            this.signKey = Keys.hmacShaKeyFor(signKey.getBytes(StandardCharsets.UTF_8)); //Crea una clave compatible con HMAC SHA-512 evitando problemas de codificación dependientes del sistema
            this.accessExpirationMillis = accessExpirationMinutes * 60 * 1000;
    }

    @Override
    public String generateAccessToken(JwtInfo info) {

        Instant now = Instant.now(); //Se usa el instante actual como referencia de tiempo para calcular la fecha de emisión y expiración del token

        return Jwts.builder()
            .setSubject(info.getUserName()) //Establece el nombre de usuario, que identificará al usuario al que pertenece el token
            .claim("userId", info.getUserId()) //Agrega información adicional al token en forma de "claims"
            .claim("role", info.getRole())
            .setIssuedAt(java.util.Date.from(now)) //Fecha de emisión del token
            .setExpiration(java.util.Date.from(now.plusMillis(accessExpirationMillis))) //Fecha de expiración del token
            .signWith(signKey) //Firma el token con la clave secreta para garantizar su integridad y autenticidad
            .compact(); //Genera la representación compacta del token JWT como un string

    }

    @Override
    public JwtInfo getInfoFromAccessToken(String token) {

        Claims claims = Jwts.parserBuilder()
            .setSigningKey(signKey) //Indica la clave con la que se debe validar la firma
            .build()
            .parseClaimsJws(token) //Parsea el token JWT y verifica su firma
            .getBody(); //Obtiene el cuerpo del token, que contiene los "claims"

        Long userId = claims.get("userId", Number.class).longValue();
        String userName = claims.getSubject();
        String role = claims.get("role", String.class);

        return new JwtInfo(userId, userName, role);

    }

}
