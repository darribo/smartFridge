package es.udc.bonilla.rivera.daniel.model.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IncorrectLoginException;

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

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private User signUpUser(String userName, String email) {

        User user = new User(userName, ENCODED_PASSWORD, email, "Daniel", "Rivera", "avatar.png", User.Role.USER);

        return userDao.save(user);
    }

    private Allergy createAllergy(String tag) {
        Allergy allergy = new Allergy(tag);
        return allergyDao.save(allergy);
    }
    
    // -------------------------------------------------------------------------
    // SignUp
    // -------------------------------------------------------------------------

    @Test
    void signUpValid() throws Exception {

        User created = userService.signUp("dani", "secret", "dani@example.com", "Daniel", "Rivera", "avatar.png");

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("dani", created.getUserName());
        assertEquals("dani@example.com", created.getEmail());
        assertEquals("Daniel", created.getFirstName());
        assertEquals("Rivera", created.getLastName());
        assertEquals("avatar.png", created.getAvatar());
        assertEquals(User.Role.USER, created.getRole());
        assertEquals(true, passwordEncoder.matches("secret", created.getPassword()));
    }

    @Test
    void signUpDuplicateUserName() {

        signUpUser("dani", "dani@example.com");

        assertThrows(DuplicateInstanceException.class,
            () -> userService.signUp("dani", "secret", "dani2@example.com", "Daniel", "Rivera", "avatar.png"));
    }

    @Test
    void signUpDuplicateEmail() {

        signUpUser("dani", "dani@example.com");

        assertThrows(DuplicateInstanceException.class,
            () -> userService.signUp("dani2", "secret", "dani@example.com", "Daniel", "Rivera", "avatar.png"));
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
    // Login
    // -------------------------------------------------------------------------

    @Test
    void loginValid() throws Exception {

        String rawPassword = "secret";
        User user = new User("daniel", passwordEncoder.encode(rawPassword), "daniel@example.com",
            "Daniel", "Rivera", "avatar.png", User.Role.USER);
        user = userDao.save(user);

        User loggedUser = userService.login("daniel", rawPassword);

        assertNotNull(loggedUser);
        assertEquals(user.getId(), loggedUser.getId());
        assertEquals("daniel", loggedUser.getUserName());
        assertEquals("daniel@example.com", loggedUser.getEmail());
    }

    @Test
    void loginWithANonExistingUserName() {

        assertThrows(IncorrectLoginException.class,
            () -> userService.login("non-existing-user", "secret"));
    }

    @Test
    void loginWithWrongPassword() {

        User user = new User("daniel", passwordEncoder.encode("secret"), "daniel@example.com",
            "Daniel", "Rivera", "avatar.png", User.Role.USER);
        userDao.save(user);

        assertThrows(IncorrectLoginException.class,
            () -> userService.login("daniel", "wrong-password"));
    }

    @Test
    void loginFromIdValid() throws Exception {

        User user = signUpUser("daniel", "daniel@example.com");

        User loggedUser = userService.loginFromId(user.getId());

        assertNotNull(loggedUser);
        assertEquals(user.getId(), loggedUser.getId());
        assertEquals("daniel", loggedUser.getUserName());
    }

    @Test
    void loginFromIdWithANonExistingId() {
        assertThrows(InstanceNotFoundException.class,
            () -> userService.loginFromId(NON_EXISTING_ID));
    }
}
