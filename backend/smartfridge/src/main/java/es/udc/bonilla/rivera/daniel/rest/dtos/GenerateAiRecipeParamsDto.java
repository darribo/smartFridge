package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "GenerateAiRecipeParams", description = "Parámetros opcionales para guiar la generación de receta con IA")
public class GenerateAiRecipeParamsDto {

    @Schema(description = "Dificultad deseada: EASY, MEDIUM, HARD", nullable = true)
    private Recipe.Difficulty difficulty;

    @Schema(description = "Tipo de cocina: SPANISH, ITALIAN, FRENCH, MEXICAN, ASIAN, JAPANESE, CHINESE, MEDITERRANEAN, AMERICAN, OTHER", nullable = true)
    private Recipe.CuisineType cuisineType;

    @Schema(description = "Tipo de dieta: STANDARD, VEGETARIAN, VEGAN, GLUTEN_FREE, DAIRY_FREE, KETO, PALEO, OTHER", nullable = true)
    private Recipe.DietType dietType;

    @Schema(description = "Tipo de comida: BREAKFAST, LUNCH, DINNER, SNACK, DESSERT", nullable = true)
    private Recipe.MealType mealType;

    @Schema(description = "Temporada: SPRING, SUMMER, AUTUMN, WINTER, ALL_YEAR", nullable = true)
    private Recipe.SeasonType seasonType;

    @Schema(description = "Número de raciones", nullable = true)
    private Integer servings;

    @Schema(description = "Si la receta debe ser vegetariana", nullable = true)
    private Boolean vegetarian;

    @Schema(description = "Si la receta debe ser vegana", nullable = true)
    private Boolean vegan;

    @Schema(description = "IDs de productos del hogar que deben aparecer en la receta", nullable = true)
    private List<Long> mustIncludeProductIds;

    @Schema(description = "Títulos de recetas a excluir (por ejemplo, la última generada en la sesión)", nullable = true)
    private List<String> excludeTitles;

    public GenerateAiRecipeParamsDto() {}

    public Recipe.Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Recipe.Difficulty difficulty) { this.difficulty = difficulty; }

    public Recipe.CuisineType getCuisineType() { return cuisineType; }
    public void setCuisineType(Recipe.CuisineType cuisineType) { this.cuisineType = cuisineType; }

    public Recipe.DietType getDietType() { return dietType; }
    public void setDietType(Recipe.DietType dietType) { this.dietType = dietType; }

    public Recipe.MealType getMealType() { return mealType; }
    public void setMealType(Recipe.MealType mealType) { this.mealType = mealType; }

    public Recipe.SeasonType getSeasonType() { return seasonType; }
    public void setSeasonType(Recipe.SeasonType seasonType) { this.seasonType = seasonType; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public Boolean getVegetarian() { return vegetarian; }
    public void setVegetarian(Boolean vegetarian) { this.vegetarian = vegetarian; }

    public Boolean getVegan() { return vegan; }
    public void setVegan(Boolean vegan) { this.vegan = vegan; }

    public List<Long> getMustIncludeProductIds() { return mustIncludeProductIds; }
    public void setMustIncludeProductIds(List<Long> mustIncludeProductIds) { this.mustIncludeProductIds = mustIncludeProductIds; }

    public List<String> getExcludeTitles() { return excludeTitles; }
    public void setExcludeTitles(List<String> excludeTitles) { this.excludeTitles = excludeTitles; }

}
