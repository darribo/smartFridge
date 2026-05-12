package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.ShoppingListItemAddedByDao;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedBy;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.FinalizeShoppingListResult;
import es.udc.bonilla.rivera.daniel.model.services.ShoppingListService;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ActiveShoppingListAlreadyExistsException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.UncheckedItemsRemainingException;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.AddShoppingListItemParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.FinalizeShoppingListParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.FinalizeShoppingListResultDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ShoppingListConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.ShoppingListDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.ShoppingListItemDto;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Lista de la Compra", description = "Operaciones sobre la lista de la compra del hogar.")
@RestController
@RequestMapping("/shopping-lists")
public class ShoppingListController {

    private static final String ACTIVE_LIST_EXISTS_CODE = "project.exceptions.ActiveShoppingListAlreadyExistsException";
    private static final String UNCHECKED_ITEMS_CODE = "project.exceptions.UncheckedItemsRemainingException";

    @Autowired
    private ShoppingListService shoppingListService;

    @Autowired
    private ShoppingListItemAddedByDao shoppingListItemAddedByDao;

    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(ActiveShoppingListAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleActiveListExists(ActiveShoppingListAlreadyExistsException ex, Locale locale) {
        String msg = messageSource.getMessage(ACTIVE_LIST_EXISTS_CODE, null, ACTIVE_LIST_EXISTS_CODE, locale);
        return new ErrorsDto(msg);
    }

    @ExceptionHandler(UncheckedItemsRemainingException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleUncheckedItems(UncheckedItemsRemainingException ex, Locale locale) {
        String msg = messageSource.getMessage(UNCHECKED_ITEMS_CODE,
                new Object[]{ex.getUncheckedCount()}, UNCHECKED_ITEMS_CODE, locale);
        return new ErrorsDto(msg);
    }

    @PostMapping("/{householdId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListDto createShoppingList(@RequestAttribute Long userId, @PathVariable Long householdId)
            throws InstanceNotFoundException, ActiveShoppingListAlreadyExistsException {

        ShoppingList list = shoppingListService.createShoppingList(userId, householdId);
        List<ShoppingListItem> items = shoppingListService.getShoppingListItems(userId, list.getId());
        return ShoppingListConversor.toDto(list, toItemDtos(items));
    }

    @GetMapping("/{householdId}/active")
    public ShoppingListDto getActiveShoppingList(@RequestAttribute Long userId, @PathVariable Long householdId)
            throws InstanceNotFoundException {

        ShoppingList list = shoppingListService.getActiveShoppingList(userId, householdId);
        List<ShoppingListItem> items = shoppingListService.getShoppingListItems(userId, list.getId());
        return ShoppingListConversor.toDto(list, toItemDtos(items));
    }

    @GetMapping("/{householdId}")
    public BlockDto<ShoppingListDto> getShoppingLists(@RequestAttribute Long userId, @PathVariable Long householdId,
            @RequestParam(defaultValue = "0") int page) throws InstanceNotFoundException {

        Block<ShoppingList> block = shoppingListService.getShoppingLists(userId, householdId, page, 10);
        List<ShoppingListDto> dtos = block.getItems().stream()
                .map(list -> ShoppingListConversor.toDto(list, List.of()))
                .collect(Collectors.toList());
        return new BlockDto<>(dtos, block.getExistMoreItems());
    }

    @PostMapping("/{listId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListItemDto addItemToList(@RequestAttribute Long userId, @PathVariable Long listId,
            @RequestBody AddShoppingListItemParamsDto params)
            throws InstanceNotFoundException, DuplicateInstanceException {

        ShoppingListItem item = shoppingListService.addItemToList(userId, listId,
                params.getProductId(), params.getCustomProductName(), params.getCustomProductBrand(),
                params.getQuantity(), params.getUnit());

        List<ShoppingListItemAddedBy> addedBys = shoppingListItemAddedByDao.findByShoppingListItemId(item.getId());
        return ShoppingListConversor.toItemDto(item, addedBys);
    }

    @PutMapping("/{listId}/items/{itemId}/toggle")
    public ShoppingListItemDto toggleItemChecked(@RequestAttribute Long userId,
            @PathVariable Long listId, @PathVariable Long itemId) throws InstanceNotFoundException {

        ShoppingListItem item = shoppingListService.toggleItemChecked(userId, listId, itemId);
        List<ShoppingListItemAddedBy> addedBys = shoppingListItemAddedByDao.findByShoppingListItemId(item.getId());
        return ShoppingListConversor.toItemDto(item, addedBys);
    }

    @DeleteMapping("/{listId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItemFromList(@RequestAttribute Long userId,
            @PathVariable Long listId, @PathVariable Long itemId) throws InstanceNotFoundException {

        shoppingListService.removeItemFromList(userId, listId, itemId);
    }

    @PostMapping("/{listId}/finalize")
    public FinalizeShoppingListResultDto finalizeShoppingList(@RequestAttribute Long userId,
            @PathVariable Long listId, @RequestBody FinalizeShoppingListParamsDto params)
            throws InstanceNotFoundException, UncheckedItemsRemainingException {

        FinalizeShoppingListResult result = shoppingListService.finalizeShoppingList(userId, listId, params.isForce());

        List<Long> allItemIds = result.getCheckedKnownItems().stream()
                .map(ShoppingListItem::getId).collect(Collectors.toList());
        allItemIds.addAll(result.getCheckedCustomItems().stream()
                .map(ShoppingListItem::getId).collect(Collectors.toList()));

        List<ShoppingListItemAddedBy> allAddedBys = allItemIds.isEmpty()
                ? List.of()
                : shoppingListItemAddedByDao.findByShoppingListItemIdIn(allItemIds);

        return ShoppingListConversor.toFinalizeResultDto(result, allAddedBys);
    }

    @DeleteMapping("/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteShoppingList(@RequestAttribute Long userId, @PathVariable Long listId)
            throws InstanceNotFoundException {

        shoppingListService.deleteShoppingList(userId, listId);
    }

    private List<ShoppingListItemDto> toItemDtos(List<ShoppingListItem> items) {
        if (items.isEmpty()) return List.of();
        List<Long> ids = items.stream().map(ShoppingListItem::getId).collect(Collectors.toList());
        List<ShoppingListItemAddedBy> allAddedBys = shoppingListItemAddedByDao.findByShoppingListItemIdIn(ids);
        return items.stream()
                .map(item -> ShoppingListConversor.toItemDto(item,
                        allAddedBys.stream()
                                .filter(ab -> ab.getId().getShoppingListItemId().equals(item.getId()))
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());
    }
}
