package es.udc.bonilla.rivera.daniel.model.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;

@Entity
public class Product {

    public enum Unit {
        G,
        KG,
        ML,
        L,
        UNIT
    }

    public enum NutriScoreGrade {
        A,
        B,
        C,
        D,
        E
    }

    public enum NovaGroup {
        GROUP_1,
        GROUP_2,
        GROUP_3,
        GROUP_4
    }

    private Long id;
    private String barcode;
    private String name;
    private String brand;
    private BigDecimal defaultPrice;
    private String image;
    private BigDecimal quantity;
    private Unit unit;
    private Boolean vegetarian;
    private Boolean vegan;
    private NutriScoreGrade nutriScoreGrade;
    private NovaGroup novaGroup;
    private LocalDateTime createdAt;
    /* private Boolean isFavorite; */
    private Household household;
    

    public Product() {}

    public Product(String barcode, String name, String brand, BigDecimal defaultPrice, String image,
            BigDecimal quantity, Unit unit, Boolean isVegetarian, Boolean isVegan, NutriScoreGrade nutriScoreGrade,
            NovaGroup novaGroup, LocalDateTime createdAt, /* Boolean isFavorite, */ Household household) {


        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.defaultPrice = defaultPrice;
        this.image = image;
        this.quantity = quantity;
        this.unit = unit;
        this.vegetarian = isVegetarian;
        this.vegan = isVegan;
        this.nutriScoreGrade = nutriScoreGrade;
        this.novaGroup = novaGroup;
        this.createdAt = createdAt;
        /* this.isFavorite = isFavorite; */
        this.household = household;
    }

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getBarcode() {
        return barcode;
    }
    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
    
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }
    public void setBrand(String brand) {
        this.brand = brand;
    }

    public BigDecimal getDefaultPrice() {
        return defaultPrice;
    }
    public void setDefaultPrice(BigDecimal defaultPrice) {
        this.defaultPrice = defaultPrice;
    }

    @Column(length = 1000)
    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }

    @Column(precision = 7, scale = 2, nullable = false)
    public BigDecimal getQuantity() {
        return quantity;
    }
    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public Unit getUnit() {
        return unit;
    }
    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public Boolean isVegetarian() {
        return vegetarian;
    }
    public void setVegetarian(Boolean vegetarian) {
        this.vegetarian = vegetarian;
    }

    public Boolean isVegan() {
        return vegan;
    }
    public void setVegan(Boolean vegan) {
        this.vegan = vegan;
    }

    public NutriScoreGrade getNutriScoreGrade() {
        return nutriScoreGrade;
    }
    public void setNutriScoreGrade(NutriScoreGrade nutriScoreGrade) {
        this.nutriScoreGrade = nutriScoreGrade;
    }

    public NovaGroup getNovaGroup() {
        return novaGroup;
    }
    public void setNovaGroup(NovaGroup novaGroup) {
        this.novaGroup = novaGroup;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /* public Boolean isFavorite() {
        return isFavorite;
    }
    public void setFavorite(Boolean isFavorite) {
        this.isFavorite = isFavorite;
    } */

    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    @JoinColumn(name="householdId")
    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }
    

}
