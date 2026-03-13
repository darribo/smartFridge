package es.udc.bonilla.rivera.daniel.rest.common;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
/**
 * Configura la publicación de archivos estáticos almacenados localmente por el backend.
 */
public class StaticFilesConfig implements WebMvcConfigurer {

    @Value("${images.uploads.root:./uploads}")
    private String uploadsRoot;

    @Override
    /**
     * Registra el handler que expone los archivos locales bajo la ruta pública {@code /files/**}.
     *
     * @param registry Registro de handlers de recursos estáticos de Spring MVC.
     */
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String rootLocation = Paths.get(uploadsRoot).toAbsolutePath().normalize().toUri().toString();

        registry.addResourceHandler("/files/**")
                .addResourceLocations(rootLocation + "/");
    }
}
