package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "NewRecipeParams", description = "Parámetros para crear una receta")
public class NewRecipeParamsDto {

    @Schema(description = "Título de la receta", example = "Tortilla de patatas")
    private String title;

    @Schema(description = "Descripción breve de la receta", nullable = true)
    private String description;

    @Schema(description = "Número de raciones", example = "4", nullable = true)
    private Integer servings;

    @Schema(description = "Minutos de preparación", example = "15", nullable = true)
    private Integer preparationMinutes;

    @Schema(description = "Minutos de cocción", example = "20", nullable = true)
    private Integer cookingMinutes;

    @Schema(description = "Minutos totales", example = "35", nullable = true)
    private Integer totalMinutes;

    @Schema(description = "Dificultad", example = "EASY", nullable = true)
    private Recipe.Difficulty difficulty;

    @Schema(description = "Tipo de cocina", example = "SPANISH", nullable = true)
    private Recipe.CuisineType cuisineType;

    @Schema(description = "Tipo de dieta", example = "VEGETARIAN", nullable = true)
    private Recipe.DietType dietType;

    @Schema(description = "Tipo de comida", example = "LUNCH", nullable = true)
    private Recipe.MealType mealType;

    @Schema(description = "Temporada", example = "ALL_YEAR", nullable = true)
    private Recipe.SeasonType seasonType;

    @Schema(description = "Indica si la receta es vegetariana", example = "true", nullable = true)
    private Boolean vegetarian;

    @Schema(description = "Indica si la receta es vegana", example = "false", nullable = true)
    private Boolean vegan;

    @Schema(description = "Instrucciones de preparación paso a paso")
    private String instructions;

    @Schema(description = "Notas adicionales", nullable = true)
    private String notes;

    @Schema(description = "Origen de la receta", example = "USER",
            allowableValues = {"LLM", "USER", "IMPORTED"})
    private Recipe.GenerationSource generationSource;

    @Schema(description = "Lista de ingredientes", nullable = true)
    private List<NewRecipeIngredientParamsDto> ingredients;

    public NewRecipeParamsDto() {}

    @NotNull
    @Size(min = 1, max = 150)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Size(max = 2000)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public Integer getPreparationMinutes() {
        return preparationMinutes;
    }

    public void setPreparationMinutes(Integer preparationMinutes) {
        this.preparationMinutes = preparationMinutes;
    }

    public Integer getCookingMinutes() {
        return cookingMinutes;
    }

    public void setCookingMinutes(Integer cookingMinutes) {
        this.cookingMinutes = cookingMinutes;
    }

    public Integer getTotalMinutes() {
        return totalMinutes;
    }

    public void setTotalMinutes(Integer totalMinutes) {
        this.totalMinutes = totalMinutes;
    }

    public Recipe.Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Recipe.Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Recipe.CuisineType getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(Recipe.CuisineType cuisineType) {
        this.cuisineType = cuisineType;
    }

    public Recipe.DietType getDietType() {
        return dietType;
    }

    public void setDietType(Recipe.DietType dietType) {
        this.dietType = dietType;
    }

    public Recipe.MealType getMealType() {
        return mealType;
    }

    public void setMealType(Recipe.MealType mealType) {
        this.mealType = mealType;
    }

    public Recipe.SeasonType getSeasonType() {
        return seasonType;
    }

    public void setSeasonType(Recipe.SeasonType seasonType) {
        this.seasonType = seasonType;
    }

    public Boolean getVegetarian() {
        return vegetarian;
    }

    public void setVegetarian(Boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public Boolean getVegan() {
        return vegan;
    }

    public void setVegan(Boolean vegan) {
        this.vegan = vegan;
    }

    @NotNull
    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @NotNull
    public Recipe.GenerationSource getGenerationSource() {
        return generationSource;
    }

    public void setGenerationSource(Recipe.GenerationSource generationSource) {
        this.generationSource = generationSource;
    }

    @Valid
    public List<NewRecipeIngredientParamsDto> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<NewRecipeIngredientParamsDto> ingredients) {
        this.ingredients = ingredients;
    }

}
