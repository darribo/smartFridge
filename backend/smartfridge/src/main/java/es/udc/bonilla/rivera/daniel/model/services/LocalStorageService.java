package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;

@Service
@Transactional
/**
 * Servicio responsable del almacenamiento local de imágenes subidas o descargadas
 * desde fuentes remotas.
 */
public class LocalStorageService {

    private static final Duration REMOTE_IMAGE_TIMEOUT = Duration.ofSeconds(15);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REMOTE_IMAGE_TIMEOUT)
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

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

    /**
     * Guarda en almacenamiento local una imagen accesible mediante URL remota.
     *
     * @param objectId Identificador del recurso dueño de la imagen.
     * @param type Tipo de carpeta de destino.
     * @param imageUrl URL remota de la imagen a descargar.
     * @return URL pública relativa para acceder a la imagen descargada.
     * @throws IOException Si falla la descarga o la escritura del fichero en disco.
     * @throws IllegalArgumentException Si la URL está vacía, el contenido supera el máximo o no es una imagen soportada.
     */
    public String saveImageFromUrl(Long objectId, String type, String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("Empty image url");
        }

        long start = System.currentTimeMillis();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(imageUrl))
                    .timeout(REMOTE_IMAGE_TIMEOUT)
                    .header("Accept", "image/*")
                    .GET()
                    .build();

            System.out.println("Downloading remote image: " + imageUrl);
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            System.out.println("Remote image status: " + response.statusCode());
            System.out.println("Remote image headers received in: " + (System.currentTimeMillis() - start) + " ms");

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IOException("Image download failed");
            }

            long contentLength = response.headers()
                    .firstValueAsLong("Content-Length")
                    .orElse(-1L);
            if (contentLength > maxSize) {
                throw new IllegalArgumentException("Max " + maxSize + "MB");
            }

            String contentType = response.headers()
                    .firstValue("Content-Type")
                    .map(value -> value.split(";")[0].trim().toLowerCase())
                    .orElse(null);

            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Invalid mime type");
            }

            String extension = switch (contentType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> throw new IllegalArgumentException("Unsupported format");
            };

            Path root = Paths.get(uploadsRoot, type);
            Files.createDirectories(root);

            String filename = objectId + "_" + UUID.randomUUID() + extension;
            Path target = root.resolve(filename);

            try (InputStream inputStream = response.body()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            System.out.println("Remote image stored in: " + (System.currentTimeMillis() - start) + " ms");

            return "/files/" + type + "/" + filename;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while downloading image", exception);
        }
    }

}
