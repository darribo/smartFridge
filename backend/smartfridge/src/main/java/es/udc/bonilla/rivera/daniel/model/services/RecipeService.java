package es.udc.bonilla.rivera.daniel.model.services;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.DietaryConflictException;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeParamsDto;

public interface RecipeService {

    Recipe createRecipe(Long userId, NewRecipeParamsDto params) throws InstanceNotFoundException, DietaryConflictException;

    Recipe updateRecipe(Long userId, Long recipeId, NewRecipeParamsDto params) throws InstanceNotFoundException, DietaryConflictException;

    void deleteRecipe(Long userId, Long recipeId) throws InstanceNotFoundException;

    Recipe getRecipe(Long userId, Long recipeId) throws InstanceNotFoundException;

    List<RecipeIngredient> getRecipeIngredients(Long recipeId);

    Block<Recipe> findRecipesByUser(Long userId, String title, Integer minMinutes, Integer maxMinutes,
            Recipe.Difficulty difficulty, Recipe.MealType mealType, Recipe.CuisineType cuisineType,
            Recipe.DietType dietType, Recipe.SeasonType seasonType,
            Boolean isVegetarian, Boolean isVegan, List<Long> productIds,
            int page, int size) throws InstanceNotFoundException;

}
