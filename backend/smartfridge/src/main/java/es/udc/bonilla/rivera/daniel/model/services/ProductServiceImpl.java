package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NovaGroup;
import es.udc.bonilla.rivera.daniel.model.entities.Product.NutriScoreGrade;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergyId;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem.StorageLocation;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
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
    public Product updateProduct(Long userId, Long productId, String name, String defaultPrice, String image, String quantity)
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
        product.setDefaultPrice(parseBigDecimal(defaultPrice));

        if (image != null && !image.isBlank()) {
            product.setImage(image);
        }

        product.setQuantity(parseBigDecimal(quantity));

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
            throws InstanceNotFoundException, InvalidExpirationDateException {

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

        ProductItem productItem = new ProductItem(
                product,
                parsedPurchaseDate,
                parsedExpirationDate,
                parsedPricePaid,
                storageLocation,
                null,
                resolvedInitialQuantity,
                resolvedInitialQuantity
        );

        return productItemDao.save(productItem);
    }

    @Override
    /** {@inheritDoc} */
    public ProductItem updateProductItem(Long userId, Long productItemId, String purchaseDate, String expirationDate, String pricePaid,
            ProductItem.StorageLocation storageLocation)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);
        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        LocalDateTime parsedPurchaseDate = purchaseDate != null ? LocalDateTime.parse(purchaseDate) : null;
        LocalDateTime parsedExpirationDate = expirationDate != null ? LocalDateTime.parse(expirationDate) : null;

        validateDates(parsedPurchaseDate, parsedExpirationDate);

        productItem.setPurchaseDate(parsedPurchaseDate);
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

        return productItemDao.findByProductId(productId); //TODO: En su momento devolver solo los productos a los que les quede cantidad, o aplicar algún criterio de ordenación (por ejemplo, fecha de caducidad) para mostrar primero los que caduquen antes.
    }

    @Override
    public int countProductItems(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);
        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return productItemDao.countByProductId(productId);
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
}
