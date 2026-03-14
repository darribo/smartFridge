package es.udc.bonilla.rivera.daniel.model.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class ProductAllergy {

    private ProductAllergyId id;
    private Product product;
    private Allergy allergy;

    public ProductAllergy() {}

    public ProductAllergy(Product product, Allergy allergy) {
        this.product = product;
        this.allergy = allergy;
        this.id = new ProductAllergyId(product.getId(), allergy.getId());
    }

    @EmbeddedId
    public ProductAllergyId getId() {
        return id;
    }
 
    public void setId(ProductAllergyId id) {
        this.id = id;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "productId")
    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @MapsId("allergyId")
    @JoinColumn(name = "allergyId")
    public Allergy getAllergy() {
        return allergy;
    }

    public void setAllergy(Allergy allergy) {
        this.allergy = allergy;
    }
}
