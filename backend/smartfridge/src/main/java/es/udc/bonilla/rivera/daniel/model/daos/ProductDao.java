package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.services.Block;

public interface ProductDao extends JpaRepository<Product, Long>{

    Optional<Product> findByIdAndHouseholdId(Long productId, Long householdId);

    boolean existsByHouseholdIdAndName(Long householdId, String name);

    boolean existsByHouseholdIdAndNameAndIdNot(Long householdId, String name, Long productId);

    boolean existsByBarcode(String barcode);

    @Query("SELECT p FROM Product p WHERE p.household.id = :householdId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Slice<Product> findByName(String name, Long householdId, Pageable pageable);

}
