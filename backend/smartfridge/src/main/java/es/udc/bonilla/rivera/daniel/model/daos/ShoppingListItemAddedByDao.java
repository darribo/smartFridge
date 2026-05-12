package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedBy;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedById;

public interface ShoppingListItemAddedByDao extends JpaRepository<ShoppingListItemAddedBy, ShoppingListItemAddedById> {

    @Query("SELECT ab FROM ShoppingListItemAddedBy ab JOIN FETCH ab.user WHERE ab.id.shoppingListItemId = :itemId")
    List<ShoppingListItemAddedBy> findByShoppingListItemId(@Param("itemId") Long itemId);

    @Query("SELECT ab FROM ShoppingListItemAddedBy ab JOIN FETCH ab.user WHERE ab.id.shoppingListItemId IN :itemIds")
    List<ShoppingListItemAddedBy> findByShoppingListItemIdIn(@Param("itemIds") List<Long> itemIds);

    void deleteByShoppingListItemId(Long shoppingListItemId);
}
