package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.RecipeDao;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductWithQuantity;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.LlmServiceException;
import es.udc.bonilla.rivera.daniel.rest.dtos.GenerateAiRecipeParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeParamsDto;

@Service
@Transactional(readOnly = true)
public class LlmService {

    private static final Logger logger = LoggerFactory.getLogger(LlmService.class);

    @Value("${llm.service.url:http://localhost:8000}")
    private String llmServiceUrl;

    @Autowired
    private ProductDao productDao;

    @Autowired
    private RecipeDao recipeDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private ObjectMapper objectMapper;

    private final HttpClient client;

    public LlmService() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    public NewRecipeParamsDto generateRecipe(Long userId, Long householdId,
            GenerateAiRecipeParamsDto params, Locale locale)
            throws InstanceNotFoundException, LlmServiceException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<Product> productSlice;
        if (Boolean.TRUE.equals(params.getVegan())) {
            productSlice = productDao.findVeganByHousehold(householdId, PageRequest.of(0, 200));
        } else if (Boolean.TRUE.equals(params.getVegetarian())) {
            productSlice = productDao.findVegetarianByHousehold(householdId, PageRequest.of(0, 200));
        } else {
            productSlice = productDao.findByName("", householdId, PageRequest.of(0, 200));
        }
        List<Product> products = productSlice.getContent();

        Map<Long, BigDecimal> quantityMap = new HashMap<>();
        productItemDao.sumRemainingQuantityByProduct(householdId)
                .forEach(row -> quantityMap.put((Long) row[0], (BigDecimal) row[1]));

        List<Long> mustIncludeIds = params.getMustIncludeProductIds();
        List<ProductWithQuantity> productsWithQuantity = products.stream()
                .map(p -> new ProductWithQuantity(
                        p.getId(),
                        p.getName(),
                        !Boolean.FALSE.equals(p.isVegetarian()),
                        !Boolean.FALSE.equals(p.isVegan()),
                        p.getUnit() != null ? p.getUnit().name() : null,
                        quantityMap.get(p.getId()),
                        mustIncludeIds != null && mustIncludeIds.contains(p.getId())
                ))
                .filter(p -> (p.getAvailableQuantity() != null && p.getAvailableQuantity().compareTo(BigDecimal.ZERO) > 0)
                        || p.isMustInclude())
                .toList();

        List<String> excludeTitles = new ArrayList<>(recipeDao.findTitlesByUserId(userId));
        if (params.getExcludeTitles() != null) {
            excludeTitles.addAll(params.getExcludeTitles());
        }

        String requestBody = buildRequestBody(productsWithQuantity, excludeTitles, params, locale);

        logger.debug("LLM request body: {}", requestBody);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(llmServiceUrl + "/generate-recipe"))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.warn("LLM service responded with status {}, body: {}", response.statusCode(), response.body());
                throw new LlmServiceException("LLM service returned status " + response.statusCode());
            }

            return parseResponse(response.body());

        } catch (LlmServiceException e) {
            throw e;
        } catch (IOException e) {
            logger.error("IO error calling LLM service", e);
            throw new LlmServiceException("IO error: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Interrupted calling LLM service", e);
            throw new LlmServiceException("Request interrupted");
        }
    }

    private String buildRequestBody(List<ProductWithQuantity> products, List<String> excludeTitles,
            GenerateAiRecipeParamsDto params, Locale locale) {
        try {
            var root = objectMapper.createObjectNode();

            var productsArray = objectMapper.createArrayNode();
            for (ProductWithQuantity p : products) {
                var node = objectMapper.createObjectNode();
                node.put("id", p.getId());
                node.put("name", p.getName());
                node.put("isVegetarian", p.isVegetarian());
                node.put("isVegan", p.isVegan());
                node.put("mustInclude", p.isMustInclude());
                if (p.getUnit() != null) node.put("unit", p.getUnit());
                if (p.getAvailableQuantity() != null) node.put("availableQuantity", p.getAvailableQuantity());
                productsArray.add(node);
            }
            root.set("products", productsArray);

            if (!excludeTitles.isEmpty()) {
                var excludeArray = objectMapper.createArrayNode();
                excludeTitles.forEach(excludeArray::add);
                root.set("exclude_titles", excludeArray);
            }

            if (params.getDifficulty() != null) root.put("difficulty", params.getDifficulty().name());
            if (params.getCuisineType() != null) root.put("cuisine_type", params.getCuisineType().name());
            if (params.getDietType() != null) root.put("diet_type", params.getDietType().name());
            if (params.getMealType() != null) root.put("meal_type", params.getMealType().name());
            if (params.getSeasonType() != null) root.put("season_type", params.getSeasonType().name());
            if (params.getServings() != null) root.put("servings", params.getServings());
            if (params.getVegetarian() != null) root.put("is_vegetarian", params.getVegetarian());
            if (params.getVegan() != null) root.put("is_vegan", params.getVegan());

            root.put("locale", locale.getLanguage());

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            logger.error("Error building LLM request body", e);
            throw new RuntimeException("Error building request body", e);
        }
    }

    private NewRecipeParamsDto parseResponse(String responseBody) throws LlmServiceException {
        try {
            var llmRecipe = objectMapper.readTree(responseBody);

            NewRecipeParamsDto dto = new NewRecipeParamsDto();
            dto.setTitle(llmRecipe.path("title").asText(null));
            dto.setDescription(textOrNull(llmRecipe, "description"));
            dto.setInstructions(llmRecipe.path("instructions").asText(null));
            dto.setNotes(textOrNull(llmRecipe, "notes"));

            if (!llmRecipe.path("servings").isMissingNode() && !llmRecipe.path("servings").isNull())
                dto.setServings(llmRecipe.path("servings").asInt());
            if (!llmRecipe.path("preparationMinutes").isMissingNode() && !llmRecipe.path("preparationMinutes").isNull())
                dto.setPreparationMinutes(llmRecipe.path("preparationMinutes").asInt());
            if (!llmRecipe.path("cookingMinutes").isMissingNode() && !llmRecipe.path("cookingMinutes").isNull())
                dto.setCookingMinutes(llmRecipe.path("cookingMinutes").asInt());
            if (!llmRecipe.path("totalMinutes").isMissingNode() && !llmRecipe.path("totalMinutes").isNull())
                dto.setTotalMinutes(llmRecipe.path("totalMinutes").asInt());

            dto.setDifficulty(parseEnum(llmRecipe, "difficulty", es.udc.bonilla.rivera.daniel.model.entities.Recipe.Difficulty.class));
            dto.setCuisineType(parseEnum(llmRecipe, "cuisineType", es.udc.bonilla.rivera.daniel.model.entities.Recipe.CuisineType.class));
            dto.setDietType(parseEnum(llmRecipe, "dietType", es.udc.bonilla.rivera.daniel.model.entities.Recipe.DietType.class));
            dto.setMealType(parseEnum(llmRecipe, "mealType", es.udc.bonilla.rivera.daniel.model.entities.Recipe.MealType.class));
            dto.setSeasonType(parseEnum(llmRecipe, "seasonType", es.udc.bonilla.rivera.daniel.model.entities.Recipe.SeasonType.class));

            if (!llmRecipe.path("vegetarian").isMissingNode() && !llmRecipe.path("vegetarian").isNull())
                dto.setVegetarian(llmRecipe.path("vegetarian").asBoolean());
            if (!llmRecipe.path("vegan").isMissingNode() && !llmRecipe.path("vegan").isNull())
                dto.setVegan(llmRecipe.path("vegan").asBoolean());

            dto.setGenerationSource(es.udc.bonilla.rivera.daniel.model.entities.Recipe.GenerationSource.LLM);

            var ingredientsNode = llmRecipe.path("ingredients");
            if (ingredientsNode.isArray()) {
                var ingredientDtos = new java.util.ArrayList<es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeIngredientParamsDto>();
                int order = 0;
                for (var ing : ingredientsNode) {
                    var ingDto = new es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeIngredientParamsDto();
                    ingDto.setName(ing.path("name").asText(null));
                    ingDto.setNotes(textOrNull(ing, "notes"));
                    ingDto.setOptionalIngredient(ing.path("optionalIngredient").asBoolean(false));
                    ingDto.setDisplayOrder(ing.path("displayOrder").isMissingNode() ? order : ing.path("displayOrder").asInt(order));

                    if (!ing.path("quantityValue").isMissingNode() && !ing.path("quantityValue").isNull())
                        ingDto.setQuantityValue(ing.path("quantityValue").asText());

                    ingDto.setUnit(parseEnum(ing, "unit", es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient.IngredientUnit.class));

                    if (!ing.path("productId").isMissingNode() && !ing.path("productId").isNull())
                        ingDto.setProductId(ing.path("productId").asLong());

                    ingredientDtos.add(ingDto);
                    order++;
                }
                dto.setIngredients(ingredientDtos);
            }

            return dto;
        } catch (Exception e) {
            logger.error("Error parsing LLM response", e);
            throw new LlmServiceException("Error parsing LLM response: " + e.getMessage());
        }
    }

    private String textOrNull(com.fasterxml.jackson.databind.JsonNode node, String field) {
        var n = node.path(field);
        if (n.isMissingNode() || n.isNull()) return null;
        String val = n.asText("").trim();
        return val.isEmpty() ? null : val;
    }

    private <T extends Enum<T>> T parseEnum(com.fasterxml.jackson.databind.JsonNode node, String field, Class<T> enumClass) {
        var n = node.path(field);
        if (n.isMissingNode() || n.isNull()) return null;
        String val = n.asText("").trim();
        if (val.isEmpty()) return null;
        try {
            return Enum.valueOf(enumClass, val);
        } catch (IllegalArgumentException e) {
            logger.debug("Unknown enum value '{}' for {}", val, enumClass.getSimpleName());
            return null;
        }
    }

}
