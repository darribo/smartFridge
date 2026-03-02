package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.Product;

public interface ProductDao extends JpaRepository<Product, Long>{

    Optional<Product> findByIdAndHouseholdId(Long productId, Long householdId);

    boolean existsByHouseholdIdAndName(Long householdId, String name);

    boolean existsByHouseholdIdAndNameAndIdNot(Long householdId, String name, Long productId);

    boolean existsByBarcode(String barcode);

}
