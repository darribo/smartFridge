package es.udc.bonilla.rivera.daniel.model.entities;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class ProductAllergyId implements Serializable {

    private Long productId;
    private Long allergyId;

    public ProductAllergyId() {}

    public ProductAllergyId(Long productId, Long allergyId) {
        this.productId = productId;
        this.allergyId = allergyId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getAllergyId() {
        return allergyId;
    }

    public void setAllergyId(Long allergyId) {
        this.allergyId = allergyId;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((productId == null) ? 0 : productId.hashCode());
        result = prime * result + ((allergyId == null) ? 0 : allergyId.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        ProductAllergyId other = (ProductAllergyId) obj;
        if (productId == null) {
            if (other.productId != null)
                return false;
        } else if (!productId.equals(other.productId))
            return false;
        if (allergyId == null) {
            if (other.allergyId != null)
                return false;
        } else if (!allergyId.equals(other.allergyId))
            return false;
        return true;
    }
}
