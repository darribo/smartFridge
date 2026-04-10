package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;

public class RecipeConversor {

    private RecipeConversor() {}

    public static RecipeSummaryDto toRecipeSummaryDto(Recipe recipe) {
        return new RecipeSummaryDto(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getImage(),
                recipe.getTotalMinutes(),
                recipe.getDifficulty(),
                recipe.getMealType());
    }

    public static RecipeIngredientDto toRecipeIngredientDto(RecipeIngredient ingredient) {
        return new RecipeIngredientDto(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getQuantityValue() != null ? ingredient.getQuantityValue().toString() : null,
                ingredient.getUnit(),
                ingredient.getNotes(),
                ingredient.getOptionalIngredient(),
                ingredient.getDisplayOrder(),
                ingredient.getProduct() != null ? ingredient.getProduct().getId() : null);
    }

    public static RecipeDto toRecipeDto(Recipe recipe, List<RecipeIngredient> ingredients) {
        List<RecipeIngredientDto> ingredientDtos = new ArrayList<>();
        for (RecipeIngredient ingredient : ingredients) {
            ingredientDtos.add(toRecipeIngredientDto(ingredient));
        }

        return new RecipeDto(
                recipe.getId(),
                recipe.getCreatedBy().getId(),
                recipe.getTitle(),
                recipe.getImage(),
                recipe.getDescription(),
                recipe.getServings(),
                recipe.getPreparationMinutes(),
                recipe.getCookingMinutes(),
                recipe.getTotalMinutes(),
                recipe.getDifficulty(),
                recipe.getCuisineType(),
                recipe.getDietType(),
                recipe.getMealType(),
                recipe.getSeasonType(),
                recipe.getVegetarian(),
                recipe.getVegan(),
                recipe.getInstructions(),
                recipe.getNotes(),
                recipe.getGenerationSource(),
                recipe.getCreatedAt().toString(),
                recipe.getUpdatedAt().toString(),
                ingredientDtos);
    }

}
