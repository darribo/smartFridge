package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;
import java.util.stream.Collectors;

import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedBy;
import es.udc.bonilla.rivera.daniel.model.services.FinalizeShoppingListResult;

public class ShoppingListConversor {

    private ShoppingListConversor() {}

    public static ShoppingListItemDto toItemDto(ShoppingListItem item, List<ShoppingListItemAddedBy> addedBys) {
        ShoppingListItemDto dto = new ShoppingListItemDto();
        dto.setId(item.getId());
        dto.setChecked(item.isChecked());
        dto.setAutoAdded(item.isAutoAdded());
        dto.setQuantity(item.getQuantity());
        dto.setUnit(item.getUnit());
        dto.setCheckedAt(item.getCheckedAt());

        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setProductImage(item.getProduct().getImage());
        } else {
            dto.setCustomProductName(item.getCustomProductName());
            dto.setCustomProductBrand(item.getCustomProductBrand());
        }

        if (item.getCheckedBy() != null) {
            dto.setCheckedByName(item.getCheckedBy().getFirstName() + " " + item.getCheckedBy().getLastName());
        }

        dto.setAddedByNames(addedBys.stream()
                .map(ab -> ab.getUser().getFirstName() + " " + ab.getUser().getLastName())
                .collect(Collectors.toList()));

        return dto;
    }

    public static ShoppingListDto toDto(ShoppingList list, List<ShoppingListItemDto> items) {
        ShoppingListDto dto = new ShoppingListDto();
        dto.setId(list.getId());
        dto.setStatus(list.getStatus());
        dto.setCreatedAt(list.getCreatedAt());
        dto.setCompletedAt(list.getCompletedAt());

        if (list.getCreatedBy() != null) {
            dto.setCreatedByName(list.getCreatedBy().getFirstName() + " " + list.getCreatedBy().getLastName());
        }

        dto.setItems(items);
        return dto;
    }

    public static FinalizeShoppingListResultDto toFinalizeResultDto(
            FinalizeShoppingListResult result,
            List<ShoppingListItemAddedBy> allAddedBys) {

        List<ShoppingListItemDto> knownDtos = result.getCheckedKnownItems().stream()
                .map(item -> toItemDto(item, addedBysForItem(allAddedBys, item.getId())))
                .collect(Collectors.toList());

        List<ShoppingListItemDto> customDtos = result.getCheckedCustomItems().stream()
                .map(item -> toItemDto(item, addedBysForItem(allAddedBys, item.getId())))
                .collect(Collectors.toList());

        return new FinalizeShoppingListResultDto(knownDtos, customDtos);
    }

    private static List<ShoppingListItemAddedBy> addedBysForItem(List<ShoppingListItemAddedBy> all, Long itemId) {
        return all.stream()
                .filter(ab -> ab.getShoppingListItem().getId().equals(itemId))
                .collect(Collectors.toList());
    }
}
