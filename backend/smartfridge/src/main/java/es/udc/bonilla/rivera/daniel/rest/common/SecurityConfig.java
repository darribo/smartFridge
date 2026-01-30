package es.udc.bonilla.rivera.daniel.rest.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) //El servidor no guarda información de sesión entre peticiones
            .csrf(csrf -> csrf.disable()) //Se deshabilita CSRF porque no se usan cookies de sesión en Bearer Tokens
            .cors(cors -> cors.disable()) //Se deshabilita CORS porque no se usan cookies de sesión en Bearer Tokens
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/users/signUp").permitAll() //Se permite el acceso sin autenticar a las rutas de login y refresh
                .anyRequest().authenticated() //El resto de rutas requieren autenticación
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); //Se añade el filtro JWT antes del filtro de autenticación por defecto

        return http.build();
    }

}
