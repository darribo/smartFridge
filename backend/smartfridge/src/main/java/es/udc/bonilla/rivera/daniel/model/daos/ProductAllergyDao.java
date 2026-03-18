package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergyId;

public interface ProductAllergyDao extends JpaRepository<ProductAllergy, ProductAllergyId> {

    boolean existsByProductIdAndAllergyId(Long productId, Long allergyId);

    List<ProductAllergy> findByProductId(Long productId);

    @Query("SELECT pa.allergy.id FROM ProductAllergy pa WHERE pa.product.id = :productId")
    List<Long> findAllergyIdsByProductId(Long productId);
}
