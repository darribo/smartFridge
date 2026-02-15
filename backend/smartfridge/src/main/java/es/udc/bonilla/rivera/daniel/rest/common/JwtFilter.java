package es.udc.bonilla.rivera.daniel.rest.common;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter{

    @Autowired
    private JwtGenerator jwtGenerator;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");

        //Si no hay cabecera Authorization o no es Bearer, se continúa sin autenticar
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7); //Se le quita el "Bearer " al token

        try{

            JwtInfo jwtInfo = jwtGenerator.getInfoFromAccessToken(token); //Se valida el token y se extrae la identidad

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + jwtInfo.getRole()); //Se crea la autoridad a partir del rol (una etiqueta de permiso que Spring Securiy sabe resolver por convención)

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                jwtInfo.getUserName(),
                null,
                List.of(authority)
            ); //Se crea el objeto de autenticación

            SecurityContextHolder.getContext().setAuthentication(authentication); //Se establece el contexto de seguridad

            request.setAttribute("userId", jwtInfo.getUserId()); //Se añade el userId como atributo de la petición para que esté disponible en los controladores

            filterChain.doFilter(request, response); //Se continúa con la cadena de filtros

        } catch(Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); //Si el token no es válido, se responde con 401 Unauthorized
        }
    }
}
