package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergyId;

public interface ProductAllergyDao extends JpaRepository<ProductAllergy, ProductAllergyId> {

    boolean existsByProductIdAndAllergyId(Long productId, Long allergyId);

    List<ProductAllergy> findByProductId(Long productId);
}
