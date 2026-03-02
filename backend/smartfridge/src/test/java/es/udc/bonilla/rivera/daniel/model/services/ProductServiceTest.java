package es.udc.bonilla.rivera.daniel.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
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
                admin.getId(), product.getId(), "2026-03-20T10:00:00", "2026-03-19T10:00:00", "2.50"));
    }

    @Test
    void updateProductItemValid() throws Exception {

        User admin = createUser("item_update");
        Household household = createHousehold("Home product item update", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Pollo");

        ProductItem created = productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "3.10");

        ProductItem updated = productService.updateProductItem(admin.getId(), created.getId(), "2026-03-02T10:00:00",
                "2026-03-12T10:00:00", "3.40");

        assertEquals(LocalDateTime.parse("2026-03-02T10:00:00"), updated.getPurchaseDate());
        assertEquals(LocalDateTime.parse("2026-03-12T10:00:00"), updated.getExpirationDate());
        assertEquals(new BigDecimal("3.40"), updated.getPricePaid());
    }

    @Test
    void deleteProductItemValid() throws Exception {

        User admin = createUser("item_delete");
        Household household = createHousehold("Home product item delete", admin);
        addUserToHousehold(admin, household);
        Product product = createProduct(household, "Huevos");

        ProductItem created = productService.createProductItem(admin.getId(), product.getId(), "2026-03-01T10:00:00",
                "2026-03-10T10:00:00", "2.20");

        productService.deleteProductItem(admin.getId(), created.getId());

        assertTrue(productItemDao.findById(created.getId()).isEmpty());
    }
}
