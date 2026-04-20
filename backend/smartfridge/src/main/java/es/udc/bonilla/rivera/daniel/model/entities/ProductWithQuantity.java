package es.udc.bonilla.rivera.daniel.model.entities;

import java.math.BigDecimal;

public class ProductWithQuantity {

    private final Long id;
    private final String name;
    private final boolean vegetarian;
    private final boolean vegan;
    private final String unit;
    private final BigDecimal availableQuantity;
    private final boolean mustInclude;

    public ProductWithQuantity(Long id, String name, boolean vegetarian, boolean vegan,
            String unit, BigDecimal availableQuantity, boolean mustInclude) {
        this.id = id;
        this.name = name;
        this.vegetarian = vegetarian;
        this.vegan = vegan;
        this.unit = unit;
        this.availableQuantity = availableQuantity;
        this.mustInclude = mustInclude;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isVegetarian() { return vegetarian; }
    public boolean isVegan() { return vegan; }
    public String getUnit() { return unit; }
    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public boolean isMustInclude() { return mustInclude; }

}
