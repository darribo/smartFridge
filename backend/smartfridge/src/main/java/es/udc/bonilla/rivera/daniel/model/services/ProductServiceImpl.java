package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.ProductIsNotFoodException;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductDao productDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private OpenFoodFactsClient openFoodFactsClient;

    @Autowired
    private LocalStorageService localStorageService;

    @Override
    public Product createProduct(Long userId, String barcode, String name, String brand, String defaultPrice, String image,
            String quantity, Product.Unit unit, Boolean isVegetarian, Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException, IOException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (productDao.existsByHouseholdIdAndName(householdId, name)) {
            throw new DuplicateInstanceException("project.entities.product", "(" + householdId + ", " + name + ")");
        }

        if (barcode != null && productDao.existsByBarcode(barcode)) {
            throw new DuplicateInstanceException("project.entities.product", "barcode: " + barcode);
        }

        Household household = permissionChecker.checkHouseholdExists(householdId);
        boolean safeIsVegetarian = Boolean.TRUE.equals(isVegetarian);
        boolean safeIsVegan = Boolean.TRUE.equals(isVegan);

        Product product = new Product(barcode, name, brand, defaultPrice != null ? new BigDecimal(defaultPrice) : null, null,
                quantity != null ? new BigDecimal(quantity) : null, unit, safeIsVegetarian, safeIsVegan, nutriScoreGrade, novaGroup,
                LocalDateTime.now().withNano(0), household);

        product = productDao.save(product);

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
    public Product updateProduct(Long userId, Long productId, String name, String defaultPrice, String image, String quantity)
            throws InstanceNotFoundException, DuplicateInstanceException {

        Product product = permissionChecker.checkProductExists(productId);

        Long householdId = product.getHousehold().getId();

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (!Objects.equals(product.getName(), name) && productDao.existsByHouseholdIdAndNameAndIdNot(householdId, name, productId)) {
            throw new DuplicateInstanceException("project.entities.product", "(" + householdId + ", " + name + ")");
        }

        product.setName(name);
        product.setDefaultPrice(defaultPrice != null ? new BigDecimal(defaultPrice) : null);
        product.setImage(image);
        product.setQuantity(quantity != null ? new BigDecimal(quantity) : null);

        return product;
    }

    @Override
    @Transactional(readOnly = true)
    public Product getProduct(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);

        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        return product;
    }

    @Override
    public void deleteProduct(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);

        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        productDao.delete(product);
    }

    @Override
    public ProductItem createProductItem(Long userId, Long productId, String purchaseDate, String expirationDate, String pricePaid)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        Product product = permissionChecker.checkProductExists(productId);

        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        LocalDateTime parsedPurchaseDate = purchaseDate != null ? LocalDateTime.parse(purchaseDate) : null;
        LocalDateTime parsedExpirationDate = expirationDate != null ? LocalDateTime.parse(expirationDate) : null;
        BigDecimal parsedPricePaid = pricePaid != null ? new BigDecimal(pricePaid) : null;

        validateDates(parsedPurchaseDate, parsedExpirationDate);

        if (parsedPricePaid != null) {
            BigDecimal currentDefaultPrice = product.getDefaultPrice();
            if (currentDefaultPrice == null || currentDefaultPrice.compareTo(parsedPricePaid) != 0) {
                product.setDefaultPrice(parsedPricePaid);
            }
        }

        ProductItem productItem = new ProductItem(product, parsedPurchaseDate, parsedExpirationDate,
                parsedPricePaid);

        return productItemDao.save(productItem);
    }

    @Override
    public ProductItem updateProductItem(Long userId, Long productItemId, String purchaseDate, String expirationDate, String pricePaid)
            throws InstanceNotFoundException, InvalidExpirationDateException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);

        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        LocalDateTime parsedPurchaseDate = purchaseDate != null ? LocalDateTime.parse(purchaseDate) : null;
        LocalDateTime parsedExpirationDate = expirationDate != null ? LocalDateTime.parse(expirationDate) : null;

        validateDates(parsedPurchaseDate, parsedExpirationDate);

        productItem.setPurchaseDate(parsedPurchaseDate);
        productItem.setExpirationDate(parsedExpirationDate);
        productItem.setPricePaid(pricePaid != null ? new BigDecimal(pricePaid) : null);

        return productItem;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductItem getProductItem(Long userId, Long productItemId) throws InstanceNotFoundException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);

        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        return productItem;
    }

    @Override
    public void deleteProductItem(Long userId, Long productItemId) throws InstanceNotFoundException {

        ProductItem productItem = permissionChecker.checkProductItemExists(productItemId);

        permissionChecker.checkUserHouseholdExists(userId, productItem.getProduct().getHousehold().getId());

        productItemDao.delete(productItem);
    }

    private void validateDates(LocalDateTime purchaseDate, LocalDateTime expirationDate) throws InvalidExpirationDateException {

        if (purchaseDate != null && expirationDate != null && expirationDate.isBefore(purchaseDate)) {
            throw new InvalidExpirationDateException();
        }
    }

    @Override
    public Block<Product> findProductsByName(Long userId, Long householdId, String name, int page, int size) throws InstanceNotFoundException {
        
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<Product> productSlice = productDao.findByName(name, householdId, PageRequest.of(page, size));

        return new Block<>(productSlice.getContent(), productSlice.hasNext());
    }

    @Override
    public Product findProductByBarcode(Long userId, Long householdId, String barcode) throws InstanceNotFoundException, ProductIsNotFoodException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Optional<Product> optionalProduct = productDao.findByBarcodeAndHouseholdId(barcode, householdId);

        if (optionalProduct.isPresent()) {
            return optionalProduct.get();
        } else {
            return openFoodFactsClient.getProductByBarcode(barcode);
        }
    }

    @Override
    public Product uploadProductImage(Long userId, Long productId, MultipartFile file) throws InstanceNotFoundException, IOException {
        
        Product product = permissionChecker.checkProductExists(productId);

        permissionChecker.checkUserHouseholdExists(userId, product.getHousehold().getId());

        String imageUrl = localStorageService.saveImage(productId, "products", file);

        product.setImage(imageUrl);

        return productDao.save(product);
    }

}
