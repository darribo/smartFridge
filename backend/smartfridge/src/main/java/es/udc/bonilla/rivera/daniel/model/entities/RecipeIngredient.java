package es.udc.bonilla.rivera.daniel.model.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class RecipeIngredient {

    public enum IngredientUnit {
        G,
        KG,
        ML,
        L,
        UNIT
    }

    private Long id;
    private Recipe recipe;
    private String name;
    private BigDecimal quantityValue;
    private IngredientUnit unit;
    private String notes;
    private Boolean optionalIngredient;
    private Integer displayOrder;
    private Product product;

    public RecipeIngredient() {}

    public RecipeIngredient(Recipe recipe, String name, BigDecimal quantityValue,
            IngredientUnit unit, String notes, Boolean optionalIngredient,
            Integer displayOrder, Product product) {
        this.recipe = recipe;
        this.name = name;
        this.quantityValue = quantityValue;
        this.unit = unit;
        this.notes = notes;
        this.optionalIngredient = optionalIngredient;
        this.displayOrder = displayOrder;
        this.product = product;
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
    @JoinColumn(name = "recipeId")
    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    @Column(nullable = false, length = 100)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column(precision = 7, scale = 2)
    public BigDecimal getQuantityValue() {
        return quantityValue;
    }

    public void setQuantityValue(BigDecimal quantityValue) {
        this.quantityValue = quantityValue;
    }

    public IngredientUnit getUnit() {
        return unit;
    }

    public void setUnit(IngredientUnit unit) {
        this.unit = unit;
    }

    @Column(length = 255)
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Column(nullable = false)
    public Boolean getOptionalIngredient() {
        return optionalIngredient;
    }

    public void setOptionalIngredient(Boolean optionalIngredient) {
        this.optionalIngredient = optionalIngredient;
    }

    @Column(nullable = false)
    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "productId")
    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

}
