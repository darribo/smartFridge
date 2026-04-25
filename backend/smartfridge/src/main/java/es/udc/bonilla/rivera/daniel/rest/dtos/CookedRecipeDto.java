package es.udc.bonilla.rivera.daniel.rest.dtos;

public class CookedRecipeDto {

    private Long id;
    private Long recipeId;
    private String cookedAt;

    public CookedRecipeDto() {}

    public CookedRecipeDto(Long id, Long recipeId, String cookedAt) {
        this.id = id;
        this.recipeId = recipeId;
        this.cookedAt = cookedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getCookedAt() {
        return cookedAt;
    }

    public void setCookedAt(String cookedAt) {
        this.cookedAt = cookedAt;
    }

}
