package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NovaGroup;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NutriScoreGrade;
import es.udc.bonilla.rivera.daniel.model.entities.Product.Unit;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;

@Service
@Transactional
public class OpenFoodFactsClient {

    private static final String BASE_URL = "https://world.openfoodfacts.org/api/v2/product/";

    private final ObjectMapper objectMapper;
    private final HttpClient client;

    private enum DietState {
        YES, NO, MAYBE, UNKNOWN, MISSING
    }

    private static final class DietAgg {
        private boolean hasNo;
        private boolean hasMaybe;
        private boolean hasUnknownOrMissing;
        private int seen;
    }

    public OpenFoodFactsClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
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
        if (barcode == null || barcode.isBlank()) {
            throw new InstanceNotFoundException("project.entities.product", "barcode");
        }

        try {
            URI uri = URI.create(BASE_URL + barcode + ".json");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
            }

            return parseProduct(response.body());

        } catch (IOException exception) {
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        } catch (ProductIsNotFoodException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new InstanceNotFoundException("project.entities.product", "barcode: " + barcode);
        }
    }

    private Product parseProduct(String responseBody)
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
        if (product.isMissingNode() || product.isNull()) {
            throw new ProductIsNotFoodException();
        }

        String barcode = root.path("code").asText("");
        String name = product.path("product_name").asText("");
        String brand = product.path("brands").asText("");
        BigDecimal defaultPrice = null; // No hay precio en OpenFoodFacts
        String image = product.path("image_url").asText("");
        BigDecimal quantity = product.path("product_quantity").asText("").isBlank() ? null : new BigDecimal(product.path("product_quantity").asText(""));
        Unit unit = null;
        try {
            unit = Product.Unit.valueOf(product.path("product_quantity_unit").asText("").toUpperCase());
        } catch (IllegalArgumentException e) {
            unit = null; // Unidad no reconocida
        }
        
        Boolean vegetarian = inferDietFromIngredients(product, "vegetarian");
        Boolean vegan = inferDietFromIngredients(product, "vegan");
        
        NutriScoreGrade nutriScoreGrade = null;
        try {
            nutriScoreGrade = Product.NutriScoreGrade.valueOf(product.path("nutriscore_grade").asText("").toUpperCase());
        } catch (IllegalArgumentException e) {
            nutriScoreGrade = null; // NutriScore no reconocido
        }
        NovaGroup novaGroup = null;

        try{
            novaGroup = Product.NovaGroup.valueOf("GROUP_" + product.path("nova_group").asText(""));
        } catch (IllegalArgumentException e) {
            novaGroup = null; // NovaGroup no reconocido
        }

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

    private Boolean inferDietFromIngredients(JsonNode productNode, String fieldName) {
        JsonNode ingredients = productNode.path("ingredients");

        // Fallback al campo global cuando no hay árbol de ingredientes.
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

    private void walkIngredients(JsonNode ingredientsArray, String fieldName, DietAgg agg) {
        for (JsonNode ingredient : ingredientsArray) {
            JsonNode nested = ingredient.path("ingredients");
            boolean hasNested = nested.isArray() && !nested.isEmpty();
            String currentValue = ingredient.path(fieldName).asText("");

            // Si el nodo es compuesto y no trae valor propio, se ignora ese nodo
            // y se decide por los subingredientes.
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

    private Boolean toBooleanOrNull(DietState state) {
        return switch (state) {
            case YES -> Boolean.TRUE;
            case NO -> Boolean.FALSE;
            default -> null;
        };
    }

}
