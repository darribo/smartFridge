package es.udc.bonilla.rivera.daniel.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserHouseholdDao;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidExpirationDateException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductDao productDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private HouseholdDao householdDao;

    @Autowired
    private UserHouseholdDao userHouseholdDao;

    @Autowired
    private LocalStorageService localStorageService;

    @TempDir
    Path tempDir;

    private User createUser(String suffix) {
        User user = new User(
                "product_user_" + suffix,
                "pass",
                "product_user_" + suffix + "@mail.com",
                "Name",
                "Last",
                "avatar.png",
                User.Role.USER);
        return userDao.save(user);
    }

    private Household createHousehold(String name, User admin) {
        Household household = new Household(name, "desc", "ES", "GA", "Galicia", admin);
        return householdDao.save(household);
    }

    private void addUserToHousehold(User user, Household household) {
        userHouseholdDao.save(new UserHousehold(user, household, LocalDateTime.now().withNano(0)));
    }

    private Product createProduct(Household household, String name) {
        Product product = new Product("1234567890123", name, "Brand", new BigDecimal("2.15"), "image.png",
                new BigDecimal("1.00"), Product.Unit.KG, true, false, Product.NutriScoreGrade.B,
                Product.NovaGroup.GROUP_2, LocalDateTime.now().withNano(0), household);
        return productDao.save(product);
    }

    @Test
    void createProductValid() throws Exception {

        User member = createUser("create_valid");
        Household household = createHousehold("Home product create", member);
        addUserToHousehold(member, household);

        Product created = productService.createProduct(member.getId(), "8437015942011", "Leche Entera", "Marca",
                "1.55", "milk.png", "1.00", Product.Unit.L, true, false, Product.NutriScoreGrade.B,
                Product.NovaGroup.GROUP_1, household.getId());

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Leche Entera", created.getName());
        assertEquals(household.getId(), created.getHousehold().getId());
    }

    @Test
    void createProductDuplicateNameInHousehold() {

        User member = createUser("create_dup");
        Household household = createHousehold("Home product duplicate", member);
        addUserToHousehold(member, household);

        assertThrows(DuplicateInstanceException.class, () -> {
            productService.createProduct(member.getId(), "1111111111111", "Pasta", "Brand", "1.00", "a.png", "1.00",
                    Product.Unit.KG, true, true, Product.NutriScoreGrade.A, Product.NovaGroup.GROUP_1,
                    household.getId());
            productService.createProduct(member.getId(), "2222222222222", "Pasta", "Brand", "1.10", "b.png", "1.00",
                    Product.Unit.KG, true, true, Product.NutriScoreGrade.A, Product.NovaGroup.GROUP_1,
                    household.getId());
        });
    }

    @Test
    void createProductDuplicateBarcode() {

        User member = createUser("create_dup_barcode");
        Household household = createHousehold("Home product duplicate barcode", member);
        addUserToHousehold(member, household);

        assertThrows(DuplicateInstanceException.class, () -> {
            productService.createProduct(member.getId(), "9999999999999", "Pasta", "Brand", "1.00", "a.png", "1.00",
                    Product.Unit.KG, true, true, Product.NutriScoreGrade.A, Product.NovaGroup.GROUP_1,
                    household.getId());
            productService.createProduct(member.getId(), "9999999999999", "Arroz", "Brand", "1.10", "b.png", "1.00",
                    Product.Unit.KG, true, true, Product.NutriScoreGrade.A, Product.NovaGroup.GROUP_1,
                    household.getId());
        });
    }

    @Test
    void updateProductDuplicateName() throws Exception {

        User member = createUser("update_dup");
        Household household = createHousehold("Home product update duplicate", member);
        addUserToHousehold(member, household);

        Product first = createProduct(household, "Arroz");
        Product second = createProduct(household, "Lentejas");

        assertThrows(DuplicateInstanceException.class,
                () -> productService.updateProduct(member.getId(), second.getId(), first.getName(), "2.55", "new.png", "2.00"));
    }

    @Test
    void getProductFailsWhenUserIsNotInHousehold() {

        User admin = createUser("get_admin");
        User outsider = createUser("get_outsider");
        Household household = createHousehold("Home product get", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Yogur");

        assertThrows(InstanceNotFoundException.class, () -> productService.getProduct(outsider.getId(), product.getId()));
    }

    @Test
    void deleteProductValid() throws Exception {

        User admin = createUser("delete_valid");
        Household household = createHousehold("Home product delete", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Queso");

        productService.deleteProduct(admin.getId(), product.getId());

        assertTrue(productDao.findById(product.getId()).isEmpty());
    }

    @Test
    void createProductItemWithInvalidDates() throws Exception {

        User admin = createUser("item_invalid_dates");
        Household household = createHousehold("Home product item dates", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Tomate");

        assertThrows(InvalidExpirationDateException.class, () -> productService.createProductItem(
                admin.getId(), product.getId(), "2026-03-20T10:00:00", "2026-03-19T10:00:00", "2.50",
                ProductItem.StorageLocation.FRIDGE));
    }

    @Test
    void updateProductItemValid() throws Exception {

        User admin = createUser("item_update");
        Household household = createHousehold("Home product item update", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Pollo");

        ProductItem created = productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "3.10", ProductItem.StorageLocation.FRIDGE);

        ProductItem updated = productService.updateProductItem(admin.getId(), created.getId(), "2026-03-02T10:00:00",
                "2026-03-12T10:00:00", "3.40", ProductItem.StorageLocation.FREEZER);

        assertEquals(LocalDateTime.parse("2026-03-02T10:00:00"), updated.getPurchaseDate());
        assertEquals(LocalDateTime.parse("2026-03-12T10:00:00"), updated.getExpirationDate());
        assertEquals(new BigDecimal("3.40"), updated.getPricePaid());
        assertEquals(ProductItem.StorageLocation.FREEZER, updated.getStorageLocation());
    }

    @Test
    void deleteProductItemValid() throws Exception {

        User admin = createUser("item_delete");
        Household household = createHousehold("Home product item delete", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Huevos");

        ProductItem created = productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "2.20", ProductItem.StorageLocation.PANTRY);

        productService.deleteProductItem(admin.getId(), created.getId());

        assertTrue(productItemDao.findById(created.getId()).isEmpty());
    }

    @Test
    void createProductItemUpdatesDefaultPriceWhenPricePaidChanges() throws Exception {

        User admin = createUser("item_default_price");
        Household household = createHousehold("Home product item price", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Garbanzos");

        productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "4.35", ProductItem.StorageLocation.FRIDGE);

        Product updatedProduct = productDao.findById(product.getId()).orElseThrow();

        assertEquals(new BigDecimal("4.35"), updatedProduct.getDefaultPrice());
    }

    @Test
    void findProductsByNameReturnsOnlyHouseholdProducts() throws Exception {

        User admin = createUser("find_by_name");
        Household household = createHousehold("Home product search", admin);
        addUserToHousehold(admin, household);

        createProduct(household, "Pan Integral");
        createProduct(household, "Pan de Molde");
        createProduct(household, "Leche");

        Block<Product> result = productService.findProductsByName(admin.getId(), household.getId(), "Pan", 0, 10);

        assertEquals(2, result.getItems().size());
        assertTrue(result.getItems().stream().allMatch(product -> product.getName().contains("Pan")));
    }

    @Test
    void findProductByBarcodeReturnsLocalProductWhenPresent() throws Exception {

        User admin = createUser("find_barcode_local");
        Household household = createHousehold("Home product barcode", admin);
        addUserToHousehold(admin, household);

        Product localProduct = new Product("8480000168641", "Sal Fina", "Marca", new BigDecimal("1.10"), null,
                new BigDecimal("1.00"), Product.Unit.KG, true, true, Product.NutriScoreGrade.A,
                Product.NovaGroup.GROUP_1, LocalDateTime.now().withNano(0), household);
        localProduct = productDao.save(localProduct);

        Product found = productService.findProductByBarcode(admin.getId(), household.getId(), "8480000168641");

        assertEquals(localProduct.getId(), found.getId());
        assertEquals("Sal Fina", found.getName());
    }

    @Test
    void uploadProductImageStoresRelativeUrlAndFile() throws Exception {

        ReflectionTestUtils.setField(localStorageService, "uploadsRoot", tempDir.toString());
        ReflectionTestUtils.setField(localStorageService, "maxSize", 3_145_728L);

        User admin = createUser("upload_image");
        Household household = createHousehold("Home product image", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Aceite");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "aceite.png",
                "image/png",
                "fake-image-content".getBytes());

        Product updated = productService.uploadProductImage(admin.getId(), product.getId(), file);

        assertNotNull(updated.getImage());
        assertTrue(updated.getImage().startsWith("/files/products/"));

        String storedFileName = updated.getImage().replace("/files/products/", "");
        assertTrue(Files.exists(tempDir.resolve("products").resolve(storedFileName)));
    }

    @Test
    void createProductItemStoresStorageLocation() throws Exception {

        User admin = createUser("item_storage_location");
        Household household = createHousehold("Home product item location", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Mantequilla");

        ProductItem created = productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "2.20", ProductItem.StorageLocation.FRIDGE);

        assertEquals(ProductItem.StorageLocation.FRIDGE, created.getStorageLocation());
    }
}
