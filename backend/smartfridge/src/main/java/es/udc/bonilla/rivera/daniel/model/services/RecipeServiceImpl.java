package es.udc.bonilla.rivera.daniel.model.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.DietaryConflictException;
import es.udc.bonilla.rivera.daniel.model.daos.RecipeDao;
import es.udc.bonilla.rivera.daniel.model.daos.RecipeIngredientDao;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.model.entities.User;
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
    private PermissionChecker permissionChecker;

    @Override
    public Recipe createRecipe(Long userId, NewRecipeParamsDto params) throws InstanceNotFoundException, DietaryConflictException {

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
            throws InstanceNotFoundException, DietaryConflictException {

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

}
