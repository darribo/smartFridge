package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Recipe {

    public enum Difficulty {
        EASY,
        MEDIUM,
        HARD
    }

    public enum CuisineType {
        SPANISH,
        ITALIAN,
        FRENCH,
        MEXICAN,
        ASIAN,
        JAPANESE,
        CHINESE,
        MEDITERRANEAN,
        AMERICAN,
        OTHER
    }

    public enum DietType {
        STANDARD,
        VEGETARIAN,
        VEGAN,
        GLUTEN_FREE,
        DAIRY_FREE,
        KETO,
        PALEO,
        OTHER
    }

    public enum MealType {
        BREAKFAST,
        LUNCH,
        DINNER,
        SNACK,
        DESSERT
    }

    public enum SeasonType {
        SPRING,
        SUMMER,
        AUTUMN,
        WINTER,
        ALL_YEAR
    }

    public enum GenerationSource {
        LLM,
        USER,
        IMPORTED
    }

    private Long id;
    private User createdBy;
    private Household household;

    private String title;
    private String description;
    private String image;

    private Integer servings;
    private Integer preparationMinutes;
    private Integer cookingMinutes;
    private Integer totalMinutes;

    private Difficulty difficulty;

    // TODO: private BigDecimal estimatedCaloriesPerServing;
    // TODO: private BigDecimal estimatedTotalCost;
    // TODO: private BigDecimal estimatedCostPerServing;

    private CuisineType cuisineType;
    private DietType dietType;
    private MealType mealType;
    private SeasonType seasonType;

    private Boolean vegetarian;
    private Boolean vegan;

    private String instructions;
    private String notes;

    private GenerationSource generationSource;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Recipe() {}

    public Recipe(User createdBy, Household household, String title, String description, Integer servings,
            Integer preparationMinutes, Integer cookingMinutes, Integer totalMinutes,
            Difficulty difficulty, CuisineType cuisineType, DietType dietType, MealType mealType,
            SeasonType seasonType, Boolean vegetarian, Boolean vegan,
            String instructions, String notes, GenerationSource generationSource,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.createdBy = createdBy;
        this.household = household;
        this.title = title;
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
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "createdByUserId")
    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "householdId")
    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    @Column(nullable = false, length = 150)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Column(length = 2000)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column(length = 1000)
    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public CuisineType getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(CuisineType cuisineType) {
        this.cuisineType = cuisineType;
    }

    public DietType getDietType() {
        return dietType;
    }

    public void setDietType(DietType dietType) {
        this.dietType = dietType;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public SeasonType getSeasonType() {
        return seasonType;
    }

    public void setSeasonType(SeasonType seasonType) {
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

    @Column(nullable = false, columnDefinition = "TEXT")
    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    @Column(columnDefinition = "TEXT")
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public GenerationSource getGenerationSource() {
        return generationSource;
    }

    public void setGenerationSource(GenerationSource generationSource) {
        this.generationSource = generationSource;
    }

    @Column(nullable = false)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Column(nullable = false)
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

}
