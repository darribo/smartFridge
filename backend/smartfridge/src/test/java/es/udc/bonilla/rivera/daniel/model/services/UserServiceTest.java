package es.udc.bonilla.rivera.daniel.model.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceTest {

    private static final String ENCODED_PASSWORD = "{bcrypt}$2a$10$7EwWc3r4YpQq8Qk0x7aG4eOe5jZ3qg9nCqjv3uJrL1j8uS6y3e3QW";

    private static final Long NON_EXISTING_ID = 999L;

    @Autowired
    private UserDao userDao;

    @Autowired
    private AllergyDao allergyDao;

    @Autowired
    private HouseholdDao householdDao;

    @Autowired
    private UserService userService;

    private User signUpUser(String userName, String email) {

        User user = new User(userName, ENCODED_PASSWORD, email, "Daniel", "Rivera", "avatar.png", User.Role.USER);

        return userDao.save(user);
    }

    private Allergy createAllergy(String tag) {
        Allergy allergy = new Allergy(tag);
        return allergyDao.save(allergy);
    }

    private Household createHousehold(String name) {
        Household household = new Household(name, "ISO 3166-1", "ES-GA", "Galicia");
        return householdDao.save(household);
    }

    // -------------------------------------------------------------------------
    // UserAllergy
    // -------------------------------------------------------------------------

    @Test
    void addUserAllergyValid() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Allergy allergy = createAllergy("Peanuts");

        UserAllergy created = userService.addUserAllergy(user.getId(), allergy.getId());

        assertNotNull(created, "El servicio debe devolver la relación creada");
        assertNotNull(created.getId(), "La relación debe tener ID compuesto");
        assertEquals(user.getId(), created.getId().getUserId());
        assertEquals(allergy.getId(), created.getId().getAllergyId());

        UserAllergy found = userService.getUserAllergy(user.getId(), allergy.getId());

        assertEquals(user, found.getUser());
        assertEquals(allergy, found.getAllergy());

        assertEquals(created, found);
    }

    @Test
    void addUserAllergyWithANonExistingUser() {

        Allergy allergy = createAllergy("Peanuts");

        assertThrows(InstanceNotFoundException.class, () -> userService.addUserAllergy(NON_EXISTING_ID, allergy.getId()));
    }

    @Test
    void addUserAllergyWithANonExistingAllergy() {

        User user = signUpUser("daniel", "daniel@example.com");

        assertThrows(InstanceNotFoundException.class, () -> userService.addUserAllergy(user.getId(), NON_EXISTING_ID));
    }

    @Test
    void addUserAllergyDuplicate() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Allergy allergy = createAllergy("Peanuts");

        userService.addUserAllergy(user.getId(), allergy.getId());

        assertThrows(DuplicateInstanceException.class, () -> userService.addUserAllergy(user.getId(), allergy.getId()));

    }

    @Test
    void removeUserAllergyValid() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Allergy allergy = createAllergy("Peanuts");

        userService.addUserAllergy(user.getId(), allergy.getId());

        userService.removeUserAllergy(user.getId(), allergy.getId());

        assertThrows(InstanceNotFoundException.class, () -> userService.getUserAllergy(user.getId(), allergy.getId()));

    }

    @Test
    void remoteUserAllergyAllowsAddingAgain() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");

        Allergy allergy = createAllergy("Peanuts");

        userService.addUserAllergy(user.getId(), allergy.getId());

        userService.removeUserAllergy(user.getId(), allergy.getId());

        assertDoesNotThrow(() -> userService.addUserAllergy(user.getId(), allergy.getId()));

    }

    @Test
    void remoteNonExistingUserAllergy() throws Exception{

        User user = signUpUser("daniel", "daniel@example.com");

        Allergy allergy = createAllergy("Peanuts");

        userService.addUserAllergy(user.getId(), allergy.getId());

        userService.removeUserAllergy(user.getId(), allergy.getId());

        assertThrows(InstanceNotFoundException.class, () -> userService.removeUserAllergy(user.getId(), allergy.getId()));

    }

    @Test
    void remoteUserAllergyWithANonExistingUser() {

        Allergy allergy = createAllergy("Peanuts");

        assertThrows(InstanceNotFoundException.class, () -> userService.removeUserAllergy(NON_EXISTING_ID, allergy.getId()));
    }

    @Test
    void remoteUserAllergyWithANonExistingAllergy() {
        User user = signUpUser("daniel", "daniel@example.com");

        assertThrows(InstanceNotFoundException.class, () -> userService.removeUserAllergy(user.getId(), NON_EXISTING_ID));
    }

    @Test
    void remoteUserAllergyWhenNoneExists() {
        User user = signUpUser("daniel", "daniel@example.com");
        Allergy allergy = createAllergy("Peanuts");

        assertThrows(InstanceNotFoundException.class, () -> userService.removeUserAllergy(user.getId(), allergy.getId()));
    }

    // -------------------------------------------------------------------------
    // UserHousehold
    // -------------------------------------------------------------------------

    @Test
    void addUserHouseholdValid() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        UserHousehold created = userService.addUserHousehold(user.getId(), household.getId());

        assertNotNull(created, "El servicio debe devolver la relación creada");
        assertNotNull(created.getId(), "La relación debe tener ID compuesto");
        assertEquals(user.getId(), created.getId().getUserId());
        assertEquals(household.getId(), created.getId().getHouseholdId());

        UserHousehold found = userService.getUserHousehold(user.getId(), household.getId());

        assertEquals(user, found.getUser());
        assertEquals(household, found.getHousehold());

        assertEquals(created, found);
    }

    @Test
    void addUserHouseholdWithANonExistingUser() {

        Household household = createHousehold("My home");

        assertThrows(InstanceNotFoundException.class,
            () -> userService.addUserHousehold(NON_EXISTING_ID, household.getId()));
    }

    @Test
    void addUserHouseholdWithANonExistingHousehold() {

        User user = signUpUser("daniel", "daniel@example.com");

        assertThrows(InstanceNotFoundException.class,
            () -> userService.addUserHousehold(user.getId(), NON_EXISTING_ID));
    }

    @Test
    void addUserHouseholdDuplicate() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        userService.addUserHousehold(user.getId(), household.getId());

        assertThrows(DuplicateInstanceException.class,
            () -> userService.addUserHousehold(user.getId(), household.getId()));
    }

    @Test
    void removeUserHouseholdValid() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        userService.addUserHousehold(user.getId(), household.getId());

        userService.removeUserHousehold(user.getId(), household.getId());

        assertThrows(InstanceNotFoundException.class,
            () -> userService.getUserHousehold(user.getId(), household.getId()));
    }

    @Test
    void removeUserHouseholdAllowsAddingAgain() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        userService.addUserHousehold(user.getId(), household.getId());

        userService.removeUserHousehold(user.getId(), household.getId());

        assertDoesNotThrow(() ->
            userService.addUserHousehold(user.getId(), household.getId()));
    }

    @Test
    void removeNonExistingUserHousehold() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        userService.addUserHousehold(user.getId(), household.getId());

        userService.removeUserHousehold(user.getId(), household.getId());

        assertThrows(InstanceNotFoundException.class,
            () -> userService.removeUserHousehold(user.getId(), household.getId()));
    }

    @Test
    void removeUserHouseholdWithANonExistingUser() {

        Household household = createHousehold("My home");

        assertThrows(InstanceNotFoundException.class,
            () -> userService.removeUserHousehold(NON_EXISTING_ID, household.getId()));
    }

    @Test
    void removeUserHouseholdWithANonExistingHousehold() {

        User user = signUpUser("daniel", "daniel@example.com");

        assertThrows(InstanceNotFoundException.class,
            () -> userService.removeUserHousehold(user.getId(), NON_EXISTING_ID));
    }

    @Test
    void removeUserHouseholdWhenNoneExists() {

        User user = signUpUser("daniel", "daniel@example.com");
        Household household = createHousehold("My home");

        assertThrows(InstanceNotFoundException.class,
            () -> userService.removeUserHousehold(user.getId(), household.getId()));
    }
}
