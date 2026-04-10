package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.domain.Slice;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;

public interface CustomizedRecipeDao {

    Slice<Recipe> findRecipes(
            Long userId,
            String title,
            Integer minMinutes,
            Integer maxMinutes,
            Recipe.Difficulty difficulty,
            Recipe.MealType mealType,
            Recipe.CuisineType cuisineType,
            Recipe.DietType dietType,
            Recipe.SeasonType seasonType,
            Boolean isVegetarian,
            Boolean isVegan,
            List<Long> productIds,
            int page,
            int size);

}
