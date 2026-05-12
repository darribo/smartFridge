package es.udc.bonilla.rivera.daniel.model.services;

import java.math.BigDecimal;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ActiveShoppingListAlreadyExistsException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.UncheckedItemsRemainingException;

public interface ShoppingListService {

    ShoppingList createShoppingList(Long userId, Long householdId)
        throws InstanceNotFoundException, ActiveShoppingListAlreadyExistsException;

    ShoppingList getActiveShoppingList(Long userId, Long householdId) throws InstanceNotFoundException;

    Block<ShoppingList> getShoppingLists(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException;

    List<ShoppingListItem> getShoppingListItems(Long userId, Long listId) throws InstanceNotFoundException;

    ShoppingListItem addItemToList(Long userId, Long listId, Long productId, String customProductName,
        String customProductBrand, BigDecimal quantity, Product.Unit unit) throws InstanceNotFoundException, DuplicateInstanceException;

    ShoppingListItem toggleItemChecked(Long userId, Long listId, Long itemId) throws InstanceNotFoundException;

    void removeItemFromList(Long userId, Long listId, Long itemId) throws InstanceNotFoundException;

    FinalizeShoppingListResult finalizeShoppingList(Long userId, Long listId, boolean force)
        throws InstanceNotFoundException, UncheckedItemsRemainingException;

    void deleteShoppingList(Long userId, Long listId) throws InstanceNotFoundException;

    void maybeAutoAddToList(Long householdId, Long productId);
}
