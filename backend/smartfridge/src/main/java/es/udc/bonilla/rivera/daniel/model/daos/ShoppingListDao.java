package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;

public interface ShoppingListDao extends JpaRepository<ShoppingList, Long> {

    Optional<ShoppingList> findByHouseholdIdAndStatus(Long householdId, ShoppingList.Status status);

    boolean existsByHouseholdIdAndStatus(Long householdId, ShoppingList.Status status);

    Slice<ShoppingList> findByHouseholdIdOrderByCreatedAtDesc(Long householdId, Pageable pageable);
}
