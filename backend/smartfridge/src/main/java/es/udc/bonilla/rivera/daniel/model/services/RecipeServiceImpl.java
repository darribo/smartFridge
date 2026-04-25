package es.udc.bonilla.rivera.daniel.model.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.CookedRecipeDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.RecipeDao;
import es.udc.bonilla.rivera.daniel.model.daos.RecipeIngredientDao;
import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.DietaryConflictException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IngredientUnitMismatchException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InsufficientStockException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeIngredientParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeParamsDto;

@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    @Autowired
    private RecipeDao recipeDao;

    @Autowired
    private RecipeIngredientDao recipeIngredientDao;

    @Autowired
    private CookedRecipeDao cookedRecipeDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private ProductService productService;

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    public Recipe createRecipe(Long userId, NewRecipeParamsDto params)
            throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException {

        User user = permissionChecker.checkUserExists(userId);

        LocalDateTime now = LocalDateTime.now().withNano(0);

        Recipe recipe = new Recipe(
                user,
                params.getTitle(),
                params.getDescription(),
                params.getServings(),
                params.getPreparationMinutes(),
                params.getCookingMinutes(),
                params.getTotalMinutes(),
                params.getDifficulty(),
                params.getCuisineType(),
                params.getDietType(),
                params.getMealType(),
                params.getSeasonType(),
                params.getVegetarian(),
                params.getVegan(),
                params.getInstructions(),
                params.getNotes(),
                params.getGenerationSource(),
                now,
                now);

        recipe = recipeDao.save(recipe);

        if (params.getIngredients() != null) {
            for (NewRecipeIngredientParamsDto ingredientParams : params.getIngredients()) {
                Product product = null;
                if (ingredientParams.getProductId() != null) {
                    product = permissionChecker.checkProductBelongsToUserHousehold(ingredientParams.getProductId(), userId);
                    if (Boolean.TRUE.equals(params.getVegetarian()) && !Boolean.TRUE.equals(product.isVegetarian()))
                        throw new DietaryConflictException(DietaryConflictException.ConflictType.VEGETARIAN, product.getName());
                    if (Boolean.TRUE.equals(params.getVegan()) && !Boolean.TRUE.equals(product.isVegan()))
                        throw new DietaryConflictException(DietaryConflictException.ConflictType.VEGAN, product.getName());
                    if (ingredientParams.getUnit() != null &&
                            !ingredientParams.getUnit().name().equals(product.getUnit().name()))
                        throw new IngredientUnitMismatchException(
                                ingredientParams.getName(),
                                ingredientParams.getUnit().name(),
                                product.getUnit().name());
                }

                BigDecimal quantityValue = ingredientParams.getQuantityValue() != null
                        ? new BigDecimal(ingredientParams.getQuantityValue())
                        : null;

                recipeIngredientDao.save(new RecipeIngredient(
                        recipe,
                        ingredientParams.getName(),
                        quantityValue,
                        ingredientParams.getUnit(),
                        ingredientParams.getNotes(),
                        ingredientParams.getOptionalIngredient() != null ? ingredientParams.getOptionalIngredient() : false,
                        ingredientParams.getDisplayOrder(),
                        product));
            }
        }

        return recipe;
    }

    @Override
    public Recipe updateRecipe(Long userId, Long recipeId, NewRecipeParamsDto params)
            throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException {

        Recipe recipe = recipeDao.findById(recipeId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.recipe", recipeId));

        if (!recipe.getCreatedBy().getId().equals(userId)) {
            throw new InstanceNotFoundException("project.entities.recipe", recipeId);
        }

        LocalDateTime now = LocalDateTime.now().withNano(0);

        recipe.setTitle(params.getTitle());
        recipe.setDescription(params.getDescription());
        recipe.setServings(params.getServings());
        recipe.setPreparationMinutes(params.getPreparationMinutes());
        recipe.setCookingMinutes(params.getCookingMinutes());
        recipe.setTotalMinutes(params.getTotalMinutes());
        recipe.setDifficulty(params.getDifficulty());
        recipe.setCuisineType(params.getCuisineType());
        recipe.setDietType(params.getDietType());
        recipe.setMealType(params.getMealType());
        recipe.setSeasonType(params.getSeasonType());
        recipe.setVegetarian(params.getVegetarian());
        recipe.setVegan(params.getVegan());
        recipe.setInstructions(params.getInstructions());
        recipe.setNotes(params.getNotes());
        recipe.setUpdatedAt(now);

        recipeIngredientDao.deleteByRecipeId(recipeId);

        if (params.getIngredients() != null) {
            for (NewRecipeIngredientParamsDto ingredientParams : params.getIngredients()) {
                Product product = null;
                if (ingredientParams.getProductId() != null) {
                    product = permissionChecker.checkProductBelongsToUserHousehold(ingredientParams.getProductId(), userId);
                    if (Boolean.TRUE.equals(params.getVegetarian()) && !Boolean.TRUE.equals(product.isVegetarian()))
                        throw new DietaryConflictException(DietaryConflictException.ConflictType.VEGETARIAN, product.getName());
                    if (Boolean.TRUE.equals(params.getVegan()) && !Boolean.TRUE.equals(product.isVegan()))
                        throw new DietaryConflictException(DietaryConflictException.ConflictType.VEGAN, product.getName());
                    if (ingredientParams.getUnit() != null &&
                            !ingredientParams.getUnit().name().equals(product.getUnit().name()))
                        throw new IngredientUnitMismatchException(
                                ingredientParams.getName(),
                                ingredientParams.getUnit().name(),
                                product.getUnit().name());
                }

                BigDecimal quantityValue = ingredientParams.getQuantityValue() != null
                        ? new BigDecimal(ingredientParams.getQuantityValue())
                        : null;

                recipeIngredientDao.save(new RecipeIngredient(
                        recipe,
                        ingredientParams.getName(),
                        quantityValue,
                        ingredientParams.getUnit(),
                        ingredientParams.getNotes(),
                        ingredientParams.getOptionalIngredient() != null ? ingredientParams.getOptionalIngredient() : false,
                        ingredientParams.getDisplayOrder(),
                        product));
            }
        }

        return recipe;
    }

    @Override
    public void deleteRecipe(Long userId, Long recipeId) throws InstanceNotFoundException {

        Recipe recipe = recipeDao.findById(recipeId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.recipe", recipeId));

        if (!recipe.getCreatedBy().getId().equals(userId)) {
            throw new InstanceNotFoundException("project.entities.recipe", recipeId);
        }

        recipeIngredientDao.deleteByRecipeId(recipeId);
        recipeDao.delete(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public Recipe getRecipe(Long userId, Long recipeId) throws InstanceNotFoundException {

        permissionChecker.checkUserExists(userId);

        Recipe recipe = recipeDao.findById(recipeId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.recipe", recipeId));

        if (!recipe.getCreatedBy().getId().equals(userId)) {
            throw new InstanceNotFoundException("project.entities.recipe", recipeId);
        }

        return recipe;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeIngredient> getRecipeIngredients(Long recipeId) {
        return recipeIngredientDao.findByRecipeIdOrderByDisplayOrderAsc(recipeId);
    }

    @Override
    @Transactional(readOnly = true)
    public Block<Recipe> findRecipesByUser(Long userId, String title, Integer minMinutes, Integer maxMinutes,
            Recipe.Difficulty difficulty, Recipe.MealType mealType, Recipe.CuisineType cuisineType,
            Recipe.DietType dietType, Recipe.SeasonType seasonType,
            Boolean isVegetarian, Boolean isVegan, List<Long> productIds,
            int page, int size) throws InstanceNotFoundException {

        permissionChecker.checkUserExists(userId);

        org.springframework.data.domain.Slice<Recipe> slice = recipeDao.findRecipes(
                userId, title, minMinutes, maxMinutes,
                difficulty, mealType, cuisineType, dietType, seasonType,
                isVegetarian, isVegan, productIds, page, size);

        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public CookRecipePreview previewCookRecipe(Long userId, Long recipeId) throws InstanceNotFoundException {

        permissionChecker.checkUserExists(userId);

        Recipe recipe = recipeDao.findById(recipeId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.recipe", recipeId));

        if (!recipe.getCreatedBy().getId().equals(userId)) {
            throw new InstanceNotFoundException("project.entities.recipe", recipeId);
        }

        List<RecipeIngredient> ingredients = recipeIngredientDao.findByRecipeIdOrderByDisplayOrderAsc(recipeId);
        List<CookIngredientPreviewLine> lines = new ArrayList<>();
        boolean canCookFully = true;

        for (RecipeIngredient ingredient : ingredients) {
            if (ingredient.getProduct() == null || ingredient.getQuantityValue() == null) {
                continue;
            }

            List<ProductItem> items = productItemDao.findActiveItemsForCooking(ingredient.getProduct().getId());
            BigDecimal available = items.stream()
                    .map(ProductItem::getQuantityRemainingValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            boolean sufficient = available.compareTo(ingredient.getQuantityValue()) >= 0;

            if (!sufficient && !Boolean.TRUE.equals(ingredient.getOptionalIngredient())) {
                canCookFully = false;
            }

            lines.add(new CookIngredientPreviewLine(
                    ingredient.getId(),
                    ingredient.getName(),
                    ingredient.getQuantityValue(),
                    available,
                    sufficient,
                    Boolean.TRUE.equals(ingredient.getOptionalIngredient()),
                    ingredient.getProduct().getId(),
                    ingredient.getUnit() != null ? ingredient.getUnit().name() : null));
        }

        return new CookRecipePreview(canCookFully, lines);
    }

    @Override
    public CookedRecipe cookRecipe(Long userId, Long recipeId, boolean forcePartial)
            throws InstanceNotFoundException, InsufficientStockException, InvalidProductItemTransactionException {

        permissionChecker.checkUserExists(userId);

        Recipe recipe = recipeDao.findById(recipeId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.recipe", recipeId));

        if (!recipe.getCreatedBy().getId().equals(userId)) {
            throw new InstanceNotFoundException("project.entities.recipe", recipeId);
        }

        List<RecipeIngredient> ingredients = recipeIngredientDao.findByRecipeIdOrderByDisplayOrderAsc(recipeId);

        if (!forcePartial) {
            List<String> insufficient = new ArrayList<>();
            for (RecipeIngredient ingredient : ingredients) {
                if (ingredient.getProduct() == null || ingredient.getQuantityValue() == null
                        || Boolean.TRUE.equals(ingredient.getOptionalIngredient())) {
                    continue;
                }
                List<ProductItem> items = productItemDao.findActiveItemsForCooking(ingredient.getProduct().getId());
                BigDecimal available = items.stream()
                        .map(ProductItem::getQuantityRemainingValue)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                if (available.compareTo(ingredient.getQuantityValue()) < 0) {
                    insufficient.add(ingredient.getName());
                }
            }
            if (!insufficient.isEmpty()) {
                throw new InsufficientStockException(insufficient);
            }
        }

        CookedRecipe cookedRecipe = cookedRecipeDao.save(new CookedRecipe(recipe, LocalDateTime.now().withNano(0)));

        for (RecipeIngredient ingredient : ingredients) {
            if (ingredient.getProduct() == null || ingredient.getQuantityValue() == null) {
                continue;
            }

            List<ProductItem> items = productItemDao.findActiveItemsForCooking(ingredient.getProduct().getId());

            if (items.isEmpty()) {
                continue;
            }

            BigDecimal available = items.stream()
                    .map(ProductItem::getQuantityRemainingValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (available.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            if (!forcePartial && available.compareTo(ingredient.getQuantityValue()) < 0
                    && Boolean.TRUE.equals(ingredient.getOptionalIngredient())) {
                continue;
            }
            if (forcePartial && available.compareTo(BigDecimal.ZERO) == 0
                    && Boolean.TRUE.equals(ingredient.getOptionalIngredient())) {
                continue;
            }

            BigDecimal remaining = forcePartial
                    ? available.min(ingredient.getQuantityValue())
                    : ingredient.getQuantityValue();

            for (ProductItem item : items) {
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                BigDecimal toConsume = item.getQuantityRemainingValue().min(remaining);
                productService.consumeProductItem(userId, item.getId(), toConsume, cookedRecipe);
                remaining = remaining.subtract(toConsume);
            }
        }

        return cookedRecipe;
    }

}
