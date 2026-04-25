package es.udc.bonilla.rivera.daniel.model.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class CookedRecipe {

    private Long id;
    private Recipe recipe;
    private LocalDateTime cookedAt;

    public CookedRecipe() {}

    public CookedRecipe(Recipe recipe, LocalDateTime cookedAt) {
        this.recipe = recipe;
        this.cookedAt = cookedAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "recipeId")
    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    @Column(nullable = false)
    public LocalDateTime getCookedAt() {
        return cookedAt;
    }

    public void setCookedAt(LocalDateTime cookedAt) {
        this.cookedAt = cookedAt;
    }

}
