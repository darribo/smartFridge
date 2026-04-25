package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.ProductAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemTransactionDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NovaGroup;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NutriScoreGrade;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergyId;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem.StorageLocation;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItemTransaction;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;

@Service
@Transactional
/**
 * Implementación de {@link ProductService} para la gestión de productos e items
 * asociados a hogares.
 */
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductDao productDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private ProductAllergyDao productAllergyDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private OpenFoodFactsClient openFoodFactsClient;

    @Autowired
    private LocalStorageService localStorageService;

    @Autowired
    private ProductItemTransactionDao productItemTransactionDao;

    @Override
    /** {@inheritDoc} */
    public Product createProduct(Long userId, String barcode, String name, String brand, String defaultPrice, String image,
            String quantity, Product.Unit unit, Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Long householdId, List<Long> allergyIds, Integer daysAfterOpening)
            throws InstanceNotFoundException, DuplicateInstanceException, IOException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (name != null && productDao.existsByHouseholdIdAndName(householdId, name)) {
            throw new DuplicateInstanceException("project.entities.product", "(" + householdId + ", " + name + ")");
        }

        if (barcode != null && !barcode.isBlank()
                && productDao.existsByBarcodeAndHouseholdId(barcode, householdId)) {
            throw new DuplicateInstanceException("project.entities.product",
                    "(" + householdId + ", barcode: " + barcode + ")");
        }

        Household household = permissionChecker.checkHouseholdExists(householdId);

        Product product = new Product(
                barcode,
                name,
                brand,
                parseBigDecimal(defaultPrice),
                null,
                parseBigDecimal(quantity),
                unit,
                isVegetarian,
                isVegan,
                nutriScoreGrade,
                novaGroup,
                LocalDateTime.now().withNano(0),
                daysAfterOpening,
                household
        );

        product = productDao.save(product);

        List<Long> resolvedAllergyIds = resolveAllergyIds(barcode, allergyIds);

        if (resolvedAllergyIds != null) {
            for (Long allergyId : resolvedAllergyIds) {
                try {
                    addProductAllergy(userId, product.getId(), allergyId);
                } catch (DuplicateInstanceException exception) {
                    // Ignorar por seguridad si se repite algún id en la lista
                }
            }
        }

        if (image != null && !image.isBlank()) {
            if (image.startsWith("http://") || image.startsWith("https://")) {
                product.setImage(localStorageService.saveImageFromUrl(product.getId(), "products", image));
            } else {
                product.setImage(image);
            }
        }

        return productDao.save(product);
    }

    @Override
    /** {@inheritDoc} */
    public Product updateProduct(Long userId, Long productId, String name, String brand,
            String defaultPrice, String quantity, Product.Unit unit,
            Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Integer daysAfterOpening)
            throws InstanceNotFoundException, DuplicateInstanceException {

        Product product = permissionChecker.checkProductExists(productId);

        Long householdId = product.getHousehold().getId();
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (!Objects.equals(product.getName(), name)
                && name != null
                && productDao.existsByHouseholdIdAndNameAndIdNot(householdId, name, productId)) {
            throw new DuplicateInstanceException("project.entities.product", "(" + householdId + ", " + name + ")");
        }

        product.setName(name);
        product.setBrand(brand != null && brand.isBlank() ? null : brand);
        product.setDefaultPrice(parseBigDecimal(defaultPrice));
        product.setQuantity(parseBigDecimal(quantity));
        product.setUnit(unit);
        product.setVegetarian(isVegetarian);
        product.setVegan(isVegan);
        product.setNutriScoreGrade(nutriScoreGrade);
        product.setNovaGroup(novaGroup);
        product.setDaysAfterOpening(daysAfterOpening);

        return product;
    }

    @Override
    @Transactional(readOnly = true)
    /** {@inheritDoc} */
    public Product getProduct(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return product;
    }

    @Override
    /** {@inheritDoc} */
    public void deleteProduct(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        productDao.delete(product);
    }

    @Override
    /** {@inheritDoc} */
    public ProductItem createProductItem(Long userId, Long productId, String purchaseDate, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation, String initialQuantityValue)
            throws InstanceNotFoundException, InvalidExpirationDateException, InvalidProductItemTransactionException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        LocalDateTime parsedPurchaseDate = purchaseDate != null ? LocalDateTime.parse(purchaseDate) : null;
        LocalDateTime parsedExpirationDate = expirationDate != null ? LocalDateTime.parse(expirationDate) : null;
        BigDecimal parsedPricePaid = parseBigDecimal(pricePaid);
        BigDecimal parsedInitialQuantity = initialQuantityValue != null ? parseBigDecimal(initialQuantityValue) : null;
        BigDecimal resolvedInitialQuantity = parsedInitialQuantity != null ? parsedInitialQuantity : product.getQuantity();

        validateDates(parsedPurchaseDate, parsedExpirationDate);

        if (parsedPricePaid != null) {
            BigDecimal currentDefaultPrice = product.getDefaultPrice();
            if (currentDefaultPrice == null || currentDefaultPrice.compareTo(parsedPricePaid) != 0) {
                product.setDefaultPrice(parsedPricePaid);
            }
        }

        ProductItem productItem = productItemDao.save(new ProductItem(
                product,
                parsedPurchaseDate,
                parsedExpirationDate,
                parsedPricePaid,
                storageLocation,
                null,
                resolvedInitialQuantity,
                BigDecimal.ZERO));

        createProductItemTransaction(userId, productItem.getId(), ProductItemTransaction.TransactionType.CREATE, productItem.getInitialQuantityValue(), null);

        return productItem;
    }

    @Override
    /** {@inheritDoc} */
    public ProductItem updateProductItem(Long userId, Long productItemId, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        LocalDateTime parsedExpirationDate = expirationDate != null ? LocalDateTime.parse(expirationDate) : null;

        validateDates(productItem.getPurchaseDate(), parsedExpirationDate);

        productItem.setExpirationDate(parsedExpirationDate);
        productItem.setPricePaid(parseBigDecimal(pricePaid));
        productItem.setStorageLocation(storageLocation);

        return productItem;
    }

    @Override
    @Transactional(readOnly = true)
    /** {@inheritDoc} */
    public ProductItem getProductItem(Long userId, Long productItemId) throws InstanceNotFoundException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        return productItem;
    }

    @Override
    /** {@inheritDoc} */
    public void deleteProductItem(Long userId, Long productItemId) throws InstanceNotFoundException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        productItemDao.delete(productItem);
    }

    /**
     * Valida la coherencia temporal entre fecha de compra y fecha de caducidad.
     *
     * @param purchaseDate Fecha de compra del item.
     * @param expirationDate Fecha de caducidad del item.
     * @throws InvalidExpirationDateException Si la fecha de caducidad es anterior a la de compra.
     */
    private void validateDates(LocalDateTime purchaseDate, LocalDateTime expirationDate)
            throws InvalidExpirationDateException {

        if (purchaseDate != null && expirationDate != null && expirationDate.isBefore(purchaseDate)) {
            throw new InvalidExpirationDateException();
        }
    }

    @Override
    /** {@inheritDoc} */
    public Block<Product> findProductsByName(Long userId, Long householdId, String name, int page, int size)
            throws InstanceNotFoundException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<Product> productSlice = productDao.findByName(name, householdId, PageRequest.of(page, size));

        return new Block<>(productSlice.getContent(), productSlice.hasNext());
    }

    @Override
    /** {@inheritDoc} */
    public ResolvedBarcodeProduct findProductByBarcode(Long userId, Long householdId, String barcode)
            throws InstanceNotFoundException, ProductIsNotFoodException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Optional<Product> optionalProduct = productDao.findByBarcodeAndHouseholdId(barcode, householdId);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            
            List<ProductAllergy> productAllergies = productAllergyDao.findByProductId(product.getId());
            List<Allergy> allergies = new ArrayList<>();

            for (ProductAllergy productAllergy : productAllergies) {
                Allergy allergy = permissionChecker.checkAllergyExists(productAllergy.getAllergy().getId());
                allergies.add(allergy);
            }

            return new ResolvedBarcodeProduct(product, allergies);
        }

        return openFoodFactsClient.getResolvedProductByBarcode(barcode);
    }

    @Override
    /** {@inheritDoc} */
    public Product uploadProductImage(Long userId, Long productId, MultipartFile file)
            throws InstanceNotFoundException, IOException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        String imageUrl = localStorageService.saveImage(productId, "products", file);
        product.setImage(imageUrl);

        return productDao.save(product);
    }

    @Override
    public Block<Product> findProducts(Long userId, Long householdId, String name, String brand, Boolean isVegetarian,
            Boolean isVegan, NutriScoreGrade nutriScoreGrade, NovaGroup novaGroup, StorageLocation storageLocation,
            int page, int size) throws InstanceNotFoundException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<Product> productSlice = productDao.findProducts(
                householdId,
                name,
                brand,
                isVegetarian,
                isVegan,
                nutriScoreGrade,
                novaGroup,
                storageLocation,
                page,
                size
        );

        return new Block<>(productSlice.getContent(), productSlice.hasNext());
    }

    @Override
    public List<ProductItem> findProductItems(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return productItemDao.findActiveByProductId(productId);
    }

    @Override
    public int countProductItems(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return productItemDao.countByProductId(productId);
    }

    @Override
    public int countActiveProductItems(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return productItemDao.countActiveByProductId(productId);
    }

    @Override
    public ProductAllergy addProductAllergy(Long userId, Long productId, Long allergyId)
            throws InstanceNotFoundException, DuplicateInstanceException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        Allergy allergy = permissionChecker.checkAllergyExists(allergyId);

        if (productAllergyDao.existsByProductIdAndAllergyId(productId, allergyId)) {
            throw new DuplicateInstanceException("project.entities.productallergy",
                    "(" + productId + ", " + allergyId + ")");
        }

        ProductAllergy productAllergy = new ProductAllergy(product, allergy);

        return productAllergyDao.save(productAllergy);
    }

    @Override
    public ProductAllergy getProductAllergy(Long userId, Long productId, Long allergyId)
            throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return permissionChecker.checkProductAllergyExists(productId, allergyId);
    }

    @Override
    public void removeProductAllergy(Long userId, Long productId, Long allergyId)
            throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        permissionChecker.checkAllergyExists(allergyId);
        permissionChecker.checkProductAllergyExists(productId, allergyId);

        productAllergyDao.deleteById(new ProductAllergyId(productId, allergyId));
    }

    private BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return new BigDecimal(value.trim());
    }

    private List<Long> resolveAllergyIds(String barcode, List<Long> allergyIds) {
        if (allergyIds != null && !allergyIds.isEmpty()) {
            return allergyIds;
        }

        if (barcode == null || barcode.isBlank()) {
            return allergyIds;
        }

        List<Long> resolvedAllergyIds = new ArrayList<>();

        try {
            for (Allergy allergy : openFoodFactsClient.getProductAllergiesByBarcode(barcode)) {
                if (allergy.getId() != null && !resolvedAllergyIds.contains(allergy.getId())) {
                    resolvedAllergyIds.add(allergy.getId());
                }
            }
        } catch (InstanceNotFoundException | ProductIsNotFoodException exception) {
            return allergyIds;
        }

        return resolvedAllergyIds;
    }

    @Override
    public Block<ProductItem> findExpiringProducts(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException {
        
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<ProductItem> productItemSlice = productItemDao.findExpiringProducts(householdId, LocalDateTime.now().plusDays(3).withNano(0), PageRequest.of(page, size));

        List<ProductItem> items = productItemSlice.getContent();
        items.forEach(item -> item.getProduct().getName()); // forzar carga del proxy lazy dentro de la transacción

        return new Block<>(items, productItemSlice.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public int getDaysUntilExpiration(Long productItemId) throws InstanceNotFoundException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);

        LocalDate today = LocalDate.now();
        int minDays = Integer.MAX_VALUE;

        if (productItem.getExpirationDate() != null) {
            int days = (int) ChronoUnit.DAYS.between(today, productItem.getExpirationDate().toLocalDate());
            minDays = Math.min(minDays, days);
        }

        if (productItem.getOpenedAt() != null && productItem.getProduct().getDaysAfterOpening() != null) {
            LocalDate expiresAfterOpening = productItem.getOpenedAt().toLocalDate().plusDays(productItem.getProduct().getDaysAfterOpening());
            int days = (int) ChronoUnit.DAYS.between(today, expiresAfterOpening);
            minDays = Math.min(minDays, days);
        }

        return minDays == Integer.MAX_VALUE ? -1 : minDays;
    }

    @Override
    public Block<ProductItem> findProductsWithLittleStock(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<ProductItem> productItemSlice = productItemDao.findProductsWithLittleStock(householdId, PageRequest.of(page, size));

        List<ProductItem> items = productItemSlice.getContent();
        items.forEach(item -> item.getProduct().getName()); // forzar carga del proxy lazy dentro de la transacción

        return new Block<>(items, productItemSlice.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public int countExpiringProducts(Long userId, Long householdId) throws InstanceNotFoundException {
        permissionChecker.checkUserHouseholdExists(userId, householdId);
        return (int) productItemDao.countExpiringProducts(householdId, LocalDateTime.now().plusDays(3).withNano(0));
    }

    @Override
    @Transactional(readOnly = true)
    public int countProductsWithLittleStock(Long userId, Long householdId) throws InstanceNotFoundException {
        permissionChecker.checkUserHouseholdExists(userId, householdId);
        return (int) productItemDao.countProductsWithLittleStock(householdId);
    }

    @Override
    @Transactional(readOnly = true)
    public int countProductItemsByHousehold(Long userId, Long householdId) throws InstanceNotFoundException {
        permissionChecker.checkUserHouseholdExists(userId, householdId);
        return (int) productItemDao.countProductItemsByHousehold(householdId);
    }

    @Override
    public ProductItem discardProductItem(Long userId, Long productItemId) throws InstanceNotFoundException, InvalidProductItemTransactionException {
        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        createProductItemTransaction(userId, productItemId, ProductItemTransaction.TransactionType.DISCARD, productItem.getQuantityRemainingValue().negate(), null);

        return productItem;
    }

    @Override
    public ProductItem openProductItem(Long userId, Long productItemId)
            throws InstanceNotFoundException, InvalidProductItemTransactionException {
        createProductItemTransaction(userId, productItemId, ProductItemTransaction.TransactionType.OPEN, BigDecimal.ZERO, null);
        return permissionChecker.checkProductItemExists(productItemId);
    }

    @Override
    public ProductItem consumeProductItem(Long userId, Long productItemId, BigDecimal amount, CookedRecipe cookedRecipe)
            throws InstanceNotFoundException, InvalidProductItemTransactionException {
        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        if (amount.compareTo(productItem.getQuantityRemainingValue()) > 0) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.CONSUME_EXCEEDS_REMAINING);
        }
        if (productItem.getOpenedAt() == null) {
            createProductItemTransaction(userId, productItemId, ProductItemTransaction.TransactionType.OPEN, BigDecimal.ZERO, null);
        }
        createProductItemTransaction(userId, productItemId, ProductItemTransaction.TransactionType.CONSUME, amount.negate(), cookedRecipe);
        return productItem;
    }

    @Override
    public ProductItem adjustProductItem(Long userId, Long productItemId, BigDecimal newQuantity)
            throws InstanceNotFoundException, InvalidProductItemTransactionException {
        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        BigDecimal delta = newQuantity.subtract(productItem.getQuantityRemainingValue());
        createProductItemTransaction(userId, productItemId, ProductItemTransaction.TransactionType.ADJUST, delta, null);
        return productItem;
    }

    private ProductItemTransaction createProductItemTransaction(Long userId, Long productItemId,
            ProductItemTransaction.TransactionType type, BigDecimal quantityDeltaValue, CookedRecipe cookedRecipe)
            throws InstanceNotFoundException, InvalidProductItemTransactionException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        if (type == ProductItemTransaction.TransactionType.CREATE && productItemTransactionDao.existsByProductItemId(productItemId)) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.ALREADY_CREATED);
        }

        if (type == ProductItemTransaction.TransactionType.DISCARD && productItem.getDiscardDate() != null) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.ALREADY_DISCARDED);
        }

        // ADJUST solo se bloquea si el item está descartado (permite re-stockear items vacíos)
        if (type == ProductItemTransaction.TransactionType.ADJUST && productItem.getDiscardDate() != null) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.ITEM_NOT_OPERABLE);
        }

        // OPEN, CONSUME y DISCARD se bloquean si el item está vacío o descartado
        if (type != ProductItemTransaction.TransactionType.CREATE && type != ProductItemTransaction.TransactionType.ADJUST &&
                (productItem.getQuantityRemainingValue().compareTo(BigDecimal.ZERO) == 0 || productItem.getDiscardDate() != null)) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.ITEM_NOT_OPERABLE);
        }

        if (type == ProductItemTransaction.TransactionType.OPEN && productItem.getOpenedAt() != null) {
            throw new InvalidProductItemTransactionException(InvalidProductItemTransactionException.ALREADY_OPENED);
        }

        ProductItemTransaction transaction = new ProductItemTransaction(
                productItem,
                permissionChecker.checkUserExists(userId),
                type,
                quantityDeltaValue,
                LocalDateTime.now().withNano(0)
        );
        transaction.setCookedRecipe(cookedRecipe);

        if (quantityDeltaValue != null) {
            productItem.setQuantityRemainingValue(productItem.getQuantityRemainingValue().add(quantityDeltaValue));
        }

        if (type == ProductItemTransaction.TransactionType.DISCARD) {
            productItem.setDiscardDate(LocalDateTime.now().withNano(0));
        }

        if (type == ProductItemTransaction.TransactionType.OPEN) {
            productItem.setOpenedAt(LocalDateTime.now().withNano(0));
        }

        return productItemTransactionDao.save(transaction);
    }
}
