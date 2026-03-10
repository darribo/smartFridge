package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class LocalStorageService {

    @Value("${images.uploads.root:uploads}")
    private String uploadsRoot;

    @Value("${images.maxSize:maxSize}") //TODO: ¿Se pone así?
    private long maxSize;

    /**
     * Guarda una imagen en almacenamiento local y devuelve la URL pública resultante.
     *
     * @param objectId Identificador del recurso dueño de la imagen (por ejemplo, id de producto).
     * @param type Tipo de carpeta de destino (por ejemplo, {@code products}).
     * @param file Archivo de imagen recibido por multipart.
     * @return URL pública relativa para acceder a la imagen guardada.
     * @throws IOException Si falla la escritura del fichero en disco.
     * @throws IllegalArgumentException Si el archivo está vacío, supera el tamaño máximo o no es un formato permitido.
     */
    public String saveImage(Long objectId, String type, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Empty file"); //TODO: Ver de internacionalizar la excepción

        if(file.getSize() > maxSize) throw new IllegalArgumentException("Max " + maxSize + "MB");

        String contentType = file.getContentType();
        if(contentType == null || !contentType.startsWith("image/")){
            throw new IllegalArgumentException("Invalid mime type");
        }

        String extension = switch (contentType){
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException("Unsupported format");
        };

        Path root = Paths.get(uploadsRoot, type);
        Files.createDirectories(root);

        String filename = objectId + "_" + UUID.randomUUID() + extension; //TODO: Qué es random UUID
        Path target = root.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // URL pública que servirá el backend
        return "/files/" + type + "/" + filename;
    }

}
