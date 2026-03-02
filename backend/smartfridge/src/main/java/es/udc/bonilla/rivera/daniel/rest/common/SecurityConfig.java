package es.udc.bonilla.rivera.daniel.rest.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) //El servidor no guarda información de sesión entre peticiones
            .csrf(csrf -> csrf.disable()) //Se deshabilita CSRF porque no se usan cookies de sesión en Bearer Tokens
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/docs/**").permitAll() //Se permite el acceso sin autenticar a la documentación Swagger
                .requestMatchers("/swagger-ui/**").permitAll() //Se permite el acceso sin autenticar a la documentación Swagger
                .requestMatchers("/users/**").permitAll() //Se permite el acceso sin autenticar a las rutas de login y refresh
                .requestMatchers("/allergies/getAll/**").permitAll()
                .requestMatchers("/households/*").permitAll()
                .requestMatchers("/households/**").permitAll()
                .requestMatchers("/products/**").permitAll()
                .anyRequest().authenticated() //El resto de rutas requieren autenticación
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); //Se añade el filtro JWT antes del filtro de autenticación por defecto

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


    

}
