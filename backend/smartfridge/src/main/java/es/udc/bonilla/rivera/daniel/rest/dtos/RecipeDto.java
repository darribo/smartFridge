package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Recipe", description = "Detalle completo de una receta")
public class RecipeDto {

    @Schema(description = "ID de la receta", example = "1")
    private Long id;

    @Schema(description = "ID del usuario que creó la receta", example = "5")
    private Long createdByUserId;

    @Schema(description = "Título de la receta", example = "Tortilla de patatas")
    private String title;

    @Schema(description = "URL de la imagen de la receta", nullable = true)
    private String image;

    @Schema(description = "Descripción breve", nullable = true)
    private String description;

    @Schema(description = "Número de raciones", example = "4", nullable = true)
    private Integer servings;

    @Schema(description = "Minutos de preparación", example = "15", nullable = true)
    private Integer preparationMinutes;

    @Schema(description = "Minutos de cocción", example = "20", nullable = true)
    private Integer cookingMinutes;

    @Schema(description = "Minutos totales", example = "35", nullable = true)
    private Integer totalMinutes;

    @Schema(description = "Dificultad", nullable = true)
    private Recipe.Difficulty difficulty;

    @Schema(description = "Tipo de cocina", nullable = true)
    private Recipe.CuisineType cuisineType;

    @Schema(description = "Tipo de dieta", nullable = true)
    private Recipe.DietType dietType;

    @Schema(description = "Tipo de comida", nullable = true)
    private Recipe.MealType mealType;

    @Schema(description = "Temporada", nullable = true)
    private Recipe.SeasonType seasonType;

    @Schema(description = "Receta vegetariana", nullable = true)
    private Boolean vegetarian;

    @Schema(description = "Receta vegana", nullable = true)
    private Boolean vegan;

    @Schema(description = "Instrucciones de preparación")
    private String instructions;

    @Schema(description = "Notas adicionales", nullable = true)
    private String notes;

    @Schema(description = "Origen de la receta", example = "USER")
    private Recipe.GenerationSource generationSource;

    @Schema(description = "Fecha de creación en formato ISO-8601", example = "2026-03-29T10:00:00")
    private String createdAt;

    @Schema(description = "Fecha de última actualización en formato ISO-8601", example = "2026-03-29T10:00:00")
    private String updatedAt;

    @Schema(description = "Lista de ingredientes ordenados por displayOrder")
    private List<RecipeIngredientDto> ingredients;

    public RecipeDto() {}

    public RecipeDto(Long id, Long createdByUserId, String title, String image, String description,
            Integer servings, Integer preparationMinutes, Integer cookingMinutes, Integer totalMinutes,
            Recipe.Difficulty difficulty, Recipe.CuisineType cuisineType, Recipe.DietType dietType,
            Recipe.MealType mealType, Recipe.SeasonType seasonType,
            Boolean vegetarian, Boolean vegan, String instructions, String notes,
            Recipe.GenerationSource generationSource, String createdAt, String updatedAt,
            List<RecipeIngredientDto> ingredients) {
        this.id = id;
        this.createdByUserId = createdByUserId;
        this.title = title;
        this.image = image;
        this.description = description;
        this.servings = servings;
        this.preparationMinutes = preparationMinutes;
        this.cookingMinutes = cookingMinutes;
        this.totalMinutes = totalMinutes;
        this.difficulty = difficulty;
        this.cuisineType = cuisineType;
        this.dietType = dietType;
        this.mealType = mealType;
        this.seasonType = seasonType;
        this.vegetarian = vegetarian;
        this.vegan = vegan;
        this.instructions = instructions;
        this.notes = notes;
        this.generationSource = generationSource;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ingredients = ingredients;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public Integer getPreparationMinutes() { return preparationMinutes; }
    public void setPreparationMinutes(Integer preparationMinutes) { this.preparationMinutes = preparationMinutes; }

    public Integer getCookingMinutes() { return cookingMinutes; }
    public void setCookingMinutes(Integer cookingMinutes) { this.cookingMinutes = cookingMinutes; }

    public Integer getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }

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

    public Boolean getVegetarian() { return vegetarian; }
    public void setVegetarian(Boolean vegetarian) { this.vegetarian = vegetarian; }

    public Boolean getVegan() { return vegan; }
    public void setVegan(Boolean vegan) { this.vegan = vegan; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Recipe.GenerationSource getGenerationSource() { return generationSource; }
    public void setGenerationSource(Recipe.GenerationSource generationSource) { this.generationSource = generationSource; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public List<RecipeIngredientDto> getIngredients() { return ingredients; }
    public void setIngredients(List<RecipeIngredientDto> ingredients) { this.ingredients = ingredients; }

}
