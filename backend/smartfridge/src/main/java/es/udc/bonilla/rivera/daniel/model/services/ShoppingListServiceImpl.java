package es.udc.bonilla.rivera.daniel.model.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.FavoriteProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.ShoppingListDao;
import es.udc.bonilla.rivera.daniel.model.daos.ShoppingListItemAddedByDao;
import es.udc.bonilla.rivera.daniel.model.daos.ShoppingListItemDao;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingList;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItem;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedBy;
import es.udc.bonilla.rivera.daniel.model.entities.ShoppingListItemAddedById;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ActiveShoppingListAlreadyExistsException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.CustomItemMatchesCatalogProductException;

@Service
@Transactional
public class ShoppingListServiceImpl implements ShoppingListService {

    @Autowired
    private ShoppingListDao shoppingListDao;

    @Autowired
    private ShoppingListItemDao shoppingListItemDao;

    @Autowired
    private ShoppingListItemAddedByDao shoppingListItemAddedByDao;

    @Autowired
    private FavoriteProductDao favoriteProductDao;

    @Autowired
    private ProductDao productDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    public ShoppingList createShoppingList(Long userId, Long householdId)
            throws InstanceNotFoundException, ActiveShoppingListAlreadyExistsException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (shoppingListDao.existsByHouseholdIdAndStatus(householdId, ShoppingList.Status.ACTIVE)) {
            throw new ActiveShoppingListAlreadyExistsException();
        }

        Household household = permissionChecker.checkHouseholdExists(householdId);
        User user = permissionChecker.checkUserExists(userId);

        ShoppingList list = new ShoppingList(household, user, LocalDateTime.now().withNano(0));
        list = shoppingListDao.save(list);

        autoPopulateFromFavorites(list, householdId);

        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public ShoppingList getActiveShoppingList(Long userId, Long householdId) throws InstanceNotFoundException {
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        ShoppingList list = shoppingListDao.findByHouseholdIdAndStatus(householdId, ShoppingList.Status.ACTIVE)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.shoppinglist", householdId));
        if (list.getCreatedBy() != null) list.getCreatedBy().getFirstName();
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public Block<ShoppingList> getShoppingLists(Long userId, Long householdId, int page, int size)
            throws InstanceNotFoundException {
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<ShoppingList> slice = shoppingListDao.findByHouseholdIdOrderByCreatedAtDesc(
                householdId, PageRequest.of(page, size));
        slice.forEach(list -> { if (list.getCreatedBy() != null) list.getCreatedBy().getFirstName(); });
        return new Block<>(slice.getContent(), slice.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShoppingListItem> getShoppingListItems(Long userId, Long listId) throws InstanceNotFoundException {
        ShoppingList list = checkListBelongsToUserHousehold(userId, listId);
        List<ShoppingListItem> items = shoppingListItemDao.findByShoppingListId(list.getId());
        items.forEach(item -> {
            if (item.getProduct() != null) item.getProduct().getName();
            if (item.getCheckedBy() != null) item.getCheckedBy().getFirstName();
        });
        return items;
    }

    @Override
    public ShoppingListItem addItemToList(Long userId, Long listId, Long productId, String customProductName,
            String customProductBrand, Integer itemCount)
            throws InstanceNotFoundException, DuplicateInstanceException, CustomItemMatchesCatalogProductException {

        ShoppingList list = checkListBelongsToUserHousehold(userId, listId);

        //Si la lista no está activa se considera que no existe para evitar que se puedan añadir items a listas finalizadas o canceladas, aunque realmente el error sería otro, pero así se simplifica el manejo de errores en el frontend al no tener que distinguir entre "lista no encontrada" y "lista no activa"
        if (list.getStatus() != ShoppingList.Status.ACTIVE) {
            throw new InstanceNotFoundException("project.entities.shoppinglist", listId);
        }

        Product product = null;
        if (productId != null) {
            product = permissionChecker.checkProductExistsInHousehold(productId, list.getHousehold().getId());

            if (shoppingListItemDao.existsByShoppingListIdAndProductId(listId, productId)) {
                throw new DuplicateInstanceException("project.entities.shoppinglistitem", productId);
            }
        } else if (customProductName != null) {
            if (productDao.existsByHouseholdIdAndNameIgnoreCase(list.getHousehold().getId(), customProductName)) {
                throw new CustomItemMatchesCatalogProductException();
            }
            if (shoppingListItemDao.existsByShoppingListIdAndCustomProductNameIgnoreCase(listId, customProductName)
                    || shoppingListItemDao.existsByShoppingListIdAndProductNameIgnoreCase(listId, customProductName)) {
                throw new DuplicateInstanceException("project.entities.shoppinglistitem", customProductName);
            }
        }

        User user = permissionChecker.checkUserExists(userId);

        ShoppingListItem item = new ShoppingListItem(list, product, customProductName, customProductBrand, itemCount, false);
        item = shoppingListItemDao.save(item);

        ShoppingListItemAddedBy addedBy = new ShoppingListItemAddedBy(item, user, LocalDateTime.now().withNano(0));
        shoppingListItemAddedByDao.save(addedBy);

        if (item.getProduct() != null) item.getProduct().getName();
        return item;
    }

    @Override
    public ShoppingListItem toggleItemChecked(Long userId, Long listId, Long itemId) throws InstanceNotFoundException {
        checkListBelongsToUserHousehold(userId, listId);

        ShoppingListItem item = shoppingListItemDao.findById(itemId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.shoppinglistitem", itemId));

        if (!item.getShoppingList().getId().equals(listId)) {
            throw new InstanceNotFoundException("project.entities.shoppinglistitem", itemId);
        }

        User user = permissionChecker.checkUserExists(userId);
        boolean nowChecked = !item.isChecked();
        item.setChecked(nowChecked);
        item.setCheckedBy(nowChecked ? user : null);
        item.setCheckedAt(nowChecked ? LocalDateTime.now().withNano(0) : null);

        ShoppingListItem saved = shoppingListItemDao.save(item);
        if (saved.getProduct() != null) saved.getProduct().getName();
        return saved;
    }

    @Override
    public ShoppingListItem updateItemCount(Long userId, Long listId, Long itemId, Integer itemCount)
            throws InstanceNotFoundException {
        checkListBelongsToUserHousehold(userId, listId);

        ShoppingListItem item = shoppingListItemDao.findById(itemId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.shoppinglistitem", itemId));

        if (!item.getShoppingList().getId().equals(listId)) {
            throw new InstanceNotFoundException("project.entities.shoppinglistitem", itemId);
        }

        item.setItemCount(itemCount);
        ShoppingListItem saved = shoppingListItemDao.save(item);
        if (saved.getProduct() != null) saved.getProduct().getName();
        return saved;
    }

    @Override
    public void removeItemFromList(Long userId, Long listId, Long itemId) throws InstanceNotFoundException {
        checkListBelongsToUserHousehold(userId, listId);

        ShoppingListItem item = shoppingListItemDao.findById(itemId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.shoppinglistitem", itemId));

        if (!item.getShoppingList().getId().equals(listId)) {
            throw new InstanceNotFoundException("project.entities.shoppinglistitem", itemId);
        }

        shoppingListItemAddedByDao.deleteByShoppingListItemId(itemId);
        shoppingListItemDao.delete(item);
    }

    @Override
    public FinalizeShoppingListResult finalizeShoppingList(Long userId, Long listId)
            throws InstanceNotFoundException {

        ShoppingList list = checkListBelongsToUserHousehold(userId, listId);

        if (list.getStatus() != ShoppingList.Status.ACTIVE) {
            throw new InstanceNotFoundException("project.entities.shoppinglist", listId);
        }

        List<ShoppingListItem> allItems = shoppingListItemDao.findByShoppingListId(listId);

        List<ShoppingListItem> checkedKnown = allItems.stream()
                .filter(i -> i.isChecked() && i.getProduct() != null)
                .collect(Collectors.toList());

        List<ShoppingListItem> checkedCustom = allItems.stream()
                .filter(i -> i.isChecked() && i.getProduct() == null && i.getCustomProductName() != null)
                .collect(Collectors.toList());

        List<ShoppingListItem> unchecked = allItems.stream()
                .filter(i -> !i.isChecked())
                .collect(Collectors.toList());

        checkedKnown.forEach(i -> {
            i.getProduct().getName();
            if (i.getCheckedBy() != null) i.getCheckedBy().getFirstName();
        });
        checkedCustom.forEach(i -> {
            if (i.getCheckedBy() != null) i.getCheckedBy().getFirstName();
        });

        list.setStatus(ShoppingList.Status.COMPLETED);
        list.setCompletedAt(LocalDateTime.now().withNano(0));
        shoppingListDao.save(list);

        if (!unchecked.isEmpty()) {
            ShoppingList newList = new ShoppingList(list.getHousehold(), null, LocalDateTime.now().withNano(0));
            newList = shoppingListDao.save(newList);
            LocalDateTime now = LocalDateTime.now().withNano(0);

            for (ShoppingListItem oldItem : unchecked) {
                ShoppingListItem newItem = new ShoppingListItem(
                        newList, oldItem.getProduct(),
                        oldItem.getCustomProductName(), oldItem.getCustomProductBrand(),
                        oldItem.getItemCount(), oldItem.isAutoAdded());
                newItem = shoppingListItemDao.save(newItem);

                List<ShoppingListItemAddedBy> addedBys = shoppingListItemAddedByDao.findByShoppingListItemId(oldItem.getId());
                final ShoppingListItem savedNewItem = newItem;
                for (ShoppingListItemAddedBy ab : addedBys) {
                    shoppingListItemAddedByDao.save(new ShoppingListItemAddedBy(savedNewItem, ab.getUser(), now));
                }
            }
        }

        return new FinalizeShoppingListResult(checkedKnown, checkedCustom);
    }

    @Override
    public void deleteShoppingList(Long userId, Long listId) throws InstanceNotFoundException {
        ShoppingList list = checkListBelongsToUserHousehold(userId, listId);

        List<ShoppingListItem> items = shoppingListItemDao.findByShoppingListId(listId);
        for (ShoppingListItem item : items) {
            shoppingListItemAddedByDao.deleteByShoppingListItemId(item.getId());
        }
        shoppingListItemDao.deleteAll(items);
        shoppingListDao.delete(list);
    }

    @Override
    public void maybeAutoAddToList(Long householdId, Long productId) {
        try {
            List<Object[]> favoriteRows = favoriteProductDao.findFavoritesByHouseholdMembersForProduct(householdId, productId);

            if (favoriteRows.isEmpty()) return;

            boolean hasLittleStock = productItemDao.findActiveByProductId(productId).stream()
                    .anyMatch(item -> item.getQuantityRemainingValue() != null
                            && item.getInitialQuantityValue() != null
                            && item.getInitialQuantityValue().compareTo(BigDecimal.ZERO) > 0
                            && item.getQuantityRemainingValue().divide(item.getInitialQuantityValue(),
                                    4, java.math.RoundingMode.HALF_UP)
                               .compareTo(new BigDecimal("0.25")) < 0);

            if (!hasLittleStock) return;

            Optional<ShoppingList> activeList = shoppingListDao.findByHouseholdIdAndStatus(householdId, ShoppingList.Status.ACTIVE);

            ShoppingList list;
            if (activeList.isPresent()) {
                list = activeList.get();
            } else {
                Household household = permissionChecker.checkHouseholdExists(householdId);
                list = new ShoppingList(household, null, LocalDateTime.now().withNano(0));
                list = shoppingListDao.save(list);
            }

            if (shoppingListItemDao.existsByShoppingListIdAndProductId(list.getId(), productId)) return;

            Product product = permissionChecker.checkProductExistsInHousehold(productId, householdId);
            ShoppingListItem item = new ShoppingListItem(list, product, null, null, null, true);
            item = shoppingListItemDao.save(item);

            LocalDateTime now = LocalDateTime.now().withNano(0);
            for (Object[] row : favoriteRows) {
                Long favUserId = (Long) row[1];
                try {
                    User favUser = permissionChecker.checkUserExists(favUserId);
                    ShoppingListItemAddedById addedById = new ShoppingListItemAddedById(item.getId(), favUserId);
                    if (!shoppingListItemAddedByDao.existsById(addedById)) {
                        shoppingListItemAddedByDao.save(new ShoppingListItemAddedBy(item, favUser, now));
                    }
                } catch (InstanceNotFoundException ignored) {}
            }

        } catch (InstanceNotFoundException ignored) {}
    }

    //Se usa para poblar la lista con productos favoritos a los que les quede poco stock al crearla, pero también se puede usar para añadir automáticamente a la lista un producto favorito al que le quede poco stock aunque la lista ya exista
    private void autoPopulateFromFavorites(ShoppingList list, Long householdId) {
        List<ProductItem> lowStockItems = productItemDao.findAllProductsWithLittleStock(householdId);

        //Primero se obtienen los items con poco stock y si hay se acaba
        if (lowStockItems.isEmpty()) return;

        List<Long> lowStockProductIds = lowStockItems.stream()
                .map(pi -> pi.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());

        List<Object[]> favoriteRows = favoriteProductDao.findFavoritesByHouseholdMembersForProducts(householdId, lowStockProductIds);

        if (favoriteRows.isEmpty()) return;
        
        //Se mapea cada producto con poco stock a los ids de usuario que lo tienen como favorito para luego añadirlo a la lista y marcar que lo han añadido esos usuarios
        Map<Long, List<Long>> productToUserIds = new HashMap<>();
        for (Object[] row : favoriteRows) {
            Long productId = (Long) row[0];
            Long userId = (Long) row[1];
            productToUserIds.computeIfAbsent(productId, k -> new ArrayList<>()).add(userId);
        }

        //Se crea un mapa para poder obtener rápidamente el ProductItem a partir del id del producto
        Map<Long, ProductItem> productItemMap = lowStockItems.stream()
                .collect(Collectors.toMap(pi -> pi.getProduct().getId(), pi -> pi, (a, b) -> a));

        LocalDateTime now = LocalDateTime.now().withNano(0);

        //Se recorren los productos favoritos con poco stock junto con los usuarios que los tienen como favoritos
        for (Map.Entry<Long, List<Long>> entry : productToUserIds.entrySet()) {
            Long productId = entry.getKey();

            //Se obtiene la lista de ids de usuarios que tienen ese producto como favorito
            List<Long> userIds = entry.getValue();

            ProductItem pi = productItemMap.get(productId);
            if (pi == null) continue;

            Product product = pi.getProduct();
            ShoppingListItem item = new ShoppingListItem(list, product, null, null, null, true);
            item = shoppingListItemDao.save(item);

            for (Long uid : userIds) {
                try {
                    User user = permissionChecker.checkUserExists(uid);
                    shoppingListItemAddedByDao.save(new ShoppingListItemAddedBy(item, user, now));
                } catch (InstanceNotFoundException ignored) {}
            }
        }
    }

    private ShoppingList checkListBelongsToUserHousehold(Long userId, Long listId) throws InstanceNotFoundException {
        ShoppingList list = shoppingListDao.findById(listId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.shoppinglist", listId));

        permissionChecker.checkUserHouseholdExists(userId, list.getHousehold().getId());
        return list;
    }
}
