package es.udc.bonilla.rivera.daniel.rest.common;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticFilesConfig implements WebMvcConfigurer {

    @Value("${images.uploads.root:./uploads}")
    private String uploadsRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String rootLocation = Paths.get(uploadsRoot).toAbsolutePath().normalize().toUri().toString();

        registry.addResourceHandler("/files/**")
                .addResourceLocations(rootLocation + "/");
    }
}
