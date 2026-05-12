package es.udc.bonilla.rivera.daniel.model.services;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;

public class FinalizeShoppingListResult {

    private final List<ShoppingListItem> checkedKnownItems;
    private final List<ShoppingListItem> checkedCustomItems;

    public FinalizeShoppingListResult(List<ShoppingListItem> checkedKnownItems, List<ShoppingListItem> checkedCustomItems) {
        this.checkedKnownItems = checkedKnownItems;
        this.checkedCustomItems = checkedCustomItems;
    }

    public List<ShoppingListItem> getCheckedKnownItems() { return checkedKnownItems; }
    public List<ShoppingListItem> getCheckedCustomItems() { return checkedCustomItems; }
}
