package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;

public interface ShoppingListItemDao extends JpaRepository<ShoppingListItem, Long> {

    List<ShoppingListItem> findByShoppingListId(Long shoppingListId);

    @Query("SELECT sli FROM ShoppingListItem sli WHERE sli.shoppingList.id = :listId AND sli.product.id = :productId")
    Optional<ShoppingListItem> findByShoppingListIdAndProductId(@Param("listId") Long listId, @Param("productId") Long productId);

    boolean existsByShoppingListIdAndProductId(Long shoppingListId, Long productId);

    boolean existsByShoppingListIdAndCustomProductNameIgnoreCase(Long shoppingListId, String customProductName);

    @Query("SELECT COUNT(sli) > 0 FROM ShoppingListItem sli JOIN sli.product p WHERE sli.shoppingList.id = :listId AND LOWER(p.name) = LOWER(:name)")
    boolean existsByShoppingListIdAndProductNameIgnoreCase(@Param("listId") Long listId, @Param("name") String name);

    long countByShoppingListIdAndChecked(Long shoppingListId, boolean checked);
}
