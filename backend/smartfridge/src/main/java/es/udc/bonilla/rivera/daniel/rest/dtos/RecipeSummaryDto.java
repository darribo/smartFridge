package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;

public class RecipeSummaryDto {

    private Long id;
    private String title;
    private String image;
    private Integer totalMinutes;
    private Recipe.Difficulty difficulty;
    private Recipe.MealType mealType;

    public RecipeSummaryDto() {}

    public RecipeSummaryDto(Long id, String title, String image, Integer totalMinutes,
            Recipe.Difficulty difficulty, Recipe.MealType mealType) {
        this.id = id;
        this.title = title;
        this.image = image;
        this.totalMinutes = totalMinutes;
        this.difficulty = difficulty;
        this.mealType = mealType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }

    public Recipe.Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Recipe.Difficulty difficulty) { this.difficulty = difficulty; }

    public Recipe.MealType getMealType() { return mealType; }
    public void setMealType(Recipe.MealType mealType) { this.mealType = mealType; }

}
