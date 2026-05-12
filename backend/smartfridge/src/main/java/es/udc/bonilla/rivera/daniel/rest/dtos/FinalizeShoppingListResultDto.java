package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

public class FinalizeShoppingListResultDto {

    private List<ShoppingListItemDto> checkedKnownItems;
    private List<ShoppingListItemDto> checkedCustomItems;

    public FinalizeShoppingListResultDto() {}

    public FinalizeShoppingListResultDto(List<ShoppingListItemDto> checkedKnownItems, List<ShoppingListItemDto> checkedCustomItems) {
        this.checkedKnownItems = checkedKnownItems;
        this.checkedCustomItems = checkedCustomItems;
    }

    public List<ShoppingListItemDto> getCheckedKnownItems() { return checkedKnownItems; }
    public void setCheckedKnownItems(List<ShoppingListItemDto> checkedKnownItems) { this.checkedKnownItems = checkedKnownItems; }

    public List<ShoppingListItemDto> getCheckedCustomItems() { return checkedCustomItems; }
    public void setCheckedCustomItems(List<ShoppingListItemDto> checkedCustomItems) { this.checkedCustomItems = checkedCustomItems; }
}
