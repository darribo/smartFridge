package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.DietaryConflictException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IngredientUnitMismatchException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InsufficientStockException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeParamsDto;

public interface RecipeService {

    Recipe createRecipe(Long userId, Long householdId, NewRecipeParamsDto params) throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException;

    Recipe updateRecipe(Long userId, Long recipeId, NewRecipeParamsDto params) throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException;

    void deleteRecipe(Long userId, Long recipeId) throws InstanceNotFoundException;

    Recipe getRecipe(Long userId, Long recipeId) throws InstanceNotFoundException;

    List<RecipeIngredient> getRecipeIngredients(Long recipeId);

    Block<Recipe> findRecipesByUser(Long userId, Long householdId, String title, Integer minMinutes, Integer maxMinutes,
            Recipe.Difficulty difficulty, Recipe.MealType mealType, Recipe.CuisineType cuisineType,
            Recipe.DietType dietType, Recipe.SeasonType seasonType,
            Boolean isVegetarian, Boolean isVegan, List<Long> productIds,
            int page, int size) throws InstanceNotFoundException;

    CookRecipePreview previewCookRecipe(Long userId, Long recipeId) throws InstanceNotFoundException;

    CookedRecipe cookRecipe(Long userId, Long recipeId, boolean forcePartial) throws InstanceNotFoundException, InsufficientStockException, InvalidProductItemTransactionException;

    Recipe uploadRecipeImage(Long userId, Long recipeId, MultipartFile file) throws InstanceNotFoundException, IOException;

}
