package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NovaGroup;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NutriScoreGrade;
import es.udc.bonilla.rivera.daniel.model.entities.Product.Unit;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;

@Service
@Transactional(readOnly = true)
/**
 * Cliente de infraestructura para consultar productos remotos en OpenFoodFacts y
 * transformarlos a entidades {@link Product} no persistidas.
 */
public class OpenFoodFactsClient {

    private static final Logger logger = LoggerFactory.getLogger(OpenFoodFactsClient.class);

    private static final String BASE_URL = "https://world.openfoodfacts.org/api/v2/product/";

    private final ObjectMapper objectMapper;
    private final HttpClient client;
    private final AllergyDao allergyDao;

    private enum DietState {
        YES, NO, MAYBE, UNKNOWN, MISSING
    }

    private static final class DietAgg {
        private boolean hasNo;
        private boolean hasMaybe;
        private boolean hasUnknownOrMissing;
        private int seen;
    }

    public OpenFoodFactsClient(ObjectMapper objectMapper, AllergyDao allergyDao) {
        this.objectMapper = objectMapper;
        this.allergyDao = allergyDao;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Consulta OpenFoodFacts por código de barras y construye un {@code Product} no persistido
     * con los datos disponibles.
     *
     * @param barcode Código de barras a consultar.
     * @return Producto construido a partir de la respuesta de OpenFoodFacts.
     * @throws InstanceNotFoundException Si el código no existe o la API no devuelve un producto válido.
     * @throws ProductIsNotFoodException Si el código corresponde a un producto no alimenticio.
     */
    public Product getProductByBarcode(String barcode) throws InstanceNotFoundException, ProductIsNotFoodException {
        return getResolvedProductByBarcode(barcode).getProduct();
    }

    public List<Allergy> getProductAllergiesByBarcode(String barcode)
            throws InstanceNotFoundException, ProductIsNotFoodException {
        return getResolvedProductByBarcode(barcode).getAllergies();
    }

    public ResolvedBarcodeProduct getResolvedProductByBarcode(String barcode)
            throws InstanceNotFoundException, ProductIsNotFoodException {

        if (barcode == null || barcode.isBlank()) {
            throw new InstanceNotFoundException("project.entities.product", "barcode");
        }

        try {
            URI uri = URI.create(BASE_URL + barcode.trim() + ".json");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.warn("OpenFoodFacts respondió con status {} para barcode {}", response.statusCode(), barcode);
                throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
            }

            return parseResolvedProduct(response.body(), barcode);

        } catch (IOException exception) {
            logger.error("Error de IO consultando OpenFoodFacts para barcode {}", barcode, exception);
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            logger.error("Interrupción consultando OpenFoodFacts para barcode {}", barcode, exception);
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        }
    }

    private ResolvedBarcodeProduct parseResolvedProduct(String responseBody, String barcode)
            throws InstanceNotFoundException, ProductIsNotFoodException {

        try {
            JsonNode root = validateAndExtractProductRoot(responseBody);
            JsonNode product = root.path("product");

            return new ResolvedBarcodeProduct(parseProduct(root, product), parseAllergies(product));
        } catch (ProductIsNotFoodException | InstanceNotFoundException exception) {
            throw exception;
        } catch (IOException exception) {
            logger.error("Error parseando JSON de OpenFoodFacts para barcode {}", barcode, exception);
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        } catch (RuntimeException exception) {
            logger.error("Error inesperado parseando producto de OpenFoodFacts para barcode {}", barcode, exception);
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        }
    }

    private Product parseProduct(JsonNode root, JsonNode product) {
        String barcode = readText(root, "code");
        String name = readText(product, "product_name");
        String brand = readText(product, "brands");
        BigDecimal defaultPrice = null; // No hay precio en OpenFoodFacts
        String image = readText(product, "image_url");

        BigDecimal quantity = parseBigDecimalSafely(product.path("product_quantity"));
        Unit unit = parseUnit(readText(product, "product_quantity_unit"));

        Boolean vegetarian = inferDietFromIngredients(product, "vegetarian");
        Boolean vegan = inferDietFromIngredients(product, "vegan");

        NutriScoreGrade nutriScoreGrade = parseNutriScore(readText(product, "nutriscore_grade"));
        NovaGroup novaGroup = parseNovaGroup(product.path("nova_group"));

        Product parsedProduct = new Product();
        parsedProduct.setId(null);
        parsedProduct.setBarcode(barcode);
        parsedProduct.setName(name);
        parsedProduct.setBrand(brand);
        parsedProduct.setDefaultPrice(defaultPrice);
        parsedProduct.setImage(image);
        parsedProduct.setQuantity(quantity);
        parsedProduct.setUnit(unit);
        parsedProduct.setVegetarian(vegetarian);
        parsedProduct.setVegan(vegan);
        parsedProduct.setNutriScoreGrade(nutriScoreGrade);
        parsedProduct.setNovaGroup(novaGroup);
        parsedProduct.setCreatedAt(null);
        parsedProduct.setHousehold(null);

        return parsedProduct;
    }

    private List<Allergy> parseAllergies(JsonNode product) {
        List<Allergy> allergies = new ArrayList<>();
        JsonNode allergensTags = product.path("allergens_tags");

        if (!allergensTags.isArray()) {
            return allergies;
        }

        for (JsonNode tagNode : allergensTags) {
            String tag = tagNode.asText("").trim();
            if (tag.isBlank()) {
                continue;
            }

            allergyDao.findByTag(tag).ifPresent(allergy -> {
                boolean alreadyIncluded = allergies.stream()
                        .anyMatch(existing -> existing.getId().equals(allergy.getId()));
                if (!alreadyIncluded) {
                    allergies.add(allergy);
                }
            });
        }

        return allergies;
    }

    private JsonNode validateAndExtractProductRoot(String responseBody)
            throws IOException, InstanceNotFoundException, ProductIsNotFoodException {

        JsonNode root = objectMapper.readTree(responseBody);

        int status = root.path("status").asInt(0);
        String statusVerbose = root.path("status_verbose").asText("").toLowerCase();

        if (status == 0 && statusVerbose.contains("different product type")) {
            throw new ProductIsNotFoodException();
        }

        if (status != 1) {
            throw new InstanceNotFoundException("project.entities.product", "barcode");
        }

        JsonNode product = root.path("product");
        if (product.isMissingNode() || product.isNull() || !product.isObject()) {
            throw new InstanceNotFoundException("project.entities.product", "barcode");
        }

        return root;
    }

    /**
     * Infiera si un producto es apto para una dieta concreta recorriendo el árbol
     * de ingredientes devuelto por OpenFoodFacts.
     *
     * @param productNode Nodo raíz del producto dentro de la respuesta JSON.
     * @param fieldName Campo a analizar ({@code vegetarian} o {@code vegan}).
     * @return {@code true}, {@code false} o {@code null} si la información es insuficiente.
     */
    private Boolean inferDietFromIngredients(JsonNode productNode, String fieldName) {
        JsonNode ingredients = productNode.path("ingredients");

        if (!ingredients.isArray() || ingredients.isEmpty()) {
            return toBooleanOrNull(parseDietState(productNode.path(fieldName).asText("")));
        }

        DietAgg agg = new DietAgg();
        walkIngredients(ingredients, fieldName, agg);

        if (agg.hasNo) {
            return Boolean.FALSE;
        }
        if (agg.seen == 0) {
            return null;
        }
        if (agg.hasMaybe || agg.hasUnknownOrMissing) {
            return null;
        }
        return Boolean.TRUE;
    }

    /**
     * Recorre recursivamente el árbol de ingredientes acumulando el estado
     * dietético encontrado en cada nodo.
     *
     * @param ingredientsArray Lista de ingredientes a recorrer.
     * @param fieldName Campo dietético a inspeccionar.
     * @param agg Acumulador con el estado agregado del recorrido.
     */
    private void walkIngredients(JsonNode ingredientsArray, String fieldName, DietAgg agg) {
        for (JsonNode ingredient : ingredientsArray) {
            JsonNode nested = ingredient.path("ingredients");
            boolean hasNested = nested.isArray() && !nested.isEmpty();
            String currentValue = ingredient.path(fieldName).asText("");

            if (hasNested && currentValue.isBlank()) {
                walkIngredients(nested, fieldName, agg);
                continue;
            }

            DietState state = parseDietState(currentValue);
            switch (state) {
                case NO:
                    agg.hasNo = true;
                    agg.seen++;
                    break;
                case YES:
                    agg.seen++;
                    break;
                case MAYBE:
                    agg.hasMaybe = true;
                    agg.seen++;
                    break;
                case UNKNOWN:
                case MISSING:
                    agg.hasUnknownOrMissing = true;
                    break;
                default:
                    break;
            }

            if (hasNested) {
                walkIngredients(nested, fieldName, agg);
            } else if (state == DietState.MISSING) {
                agg.hasUnknownOrMissing = true;
            }
        }
    }

    /**
     * Convierte el valor textual devuelto por OpenFoodFacts al enum interno usado
     * por el agregador dietético.
     *
     * @param raw Valor textual del campo dietético.
     * @return Estado dietético equivalente.
     */
    private DietState parseDietState(String raw) {
        String value = raw == null ? "" : raw.trim().toLowerCase();
        return switch (value) {
            case "yes" -> DietState.YES;
            case "no" -> DietState.NO;
            case "maybe" -> DietState.MAYBE;
            case "unknown" -> DietState.UNKNOWN;
            default -> DietState.MISSING;
        };
    }

    /**
     * Convierte un {@link DietState} simple a un booleano triestado.
     *
     * @param state Estado dietético.
     * @return {@code true}, {@code false} o {@code null} si no hay certeza.
     */
    private Boolean toBooleanOrNull(DietState state) {
        return switch (state) {
            case YES -> Boolean.TRUE;
            case NO -> Boolean.FALSE;
            default -> null;
        };
    }

    private String readText(JsonNode node, String fieldName) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        return node.path(fieldName).asText("").trim();
    }

    private BigDecimal parseBigDecimalSafely(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        String raw = node.asText("").trim();
        if (raw.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException exception) {
            logger.debug("No se pudo parsear BigDecimal desde '{}'", raw);
            return null;
        }
    }

    private Unit parseUnit(String rawUnit) {
        if (rawUnit == null || rawUnit.isBlank()) {
            return null;
        }

        try {
            return Product.Unit.valueOf(rawUnit.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            logger.debug("Unidad no reconocida en OpenFoodFacts: {}", rawUnit);
            return null;
        }
    }

    private NutriScoreGrade parseNutriScore(String rawGrade) {
        if (rawGrade == null || rawGrade.isBlank()) {
            return null;
        }

        try {
            return Product.NutriScoreGrade.valueOf(rawGrade.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            logger.debug("NutriScore no reconocido en OpenFoodFacts: {}", rawGrade);
            return null;
        }
    }

    private NovaGroup parseNovaGroup(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }

        String raw = node.asText("").trim();
        if (raw.isBlank()) {
            return null;
        }

        try {
            return Product.NovaGroup.valueOf("GROUP_" + raw);
        } catch (IllegalArgumentException exception) {
            logger.debug("Nova group no reconocido en OpenFoodFacts: {}", raw);
            return null;
        }
    }
}
