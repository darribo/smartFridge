package es.udc.bonilla.rivera.daniel.model.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.ProductAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergyId;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IncorrectLoginException;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private UserAllergyDao userAllergyDao;

    @Autowired
    private ProductAllergyDao productAllergyDao;

    @Override
    public User signUp(String userName, String password, String email, String firstName, String lastName, String avatar) throws DuplicateInstanceException {
        
        if(userDao.existsByUserName(userName)){
            throw new DuplicateInstanceException("project.entities.user", "nombre de usuario");
        }
        
        if(userDao.existsByEmail(email)){
            throw new DuplicateInstanceException("project.entities.user", "email");
        }

        String newPassword = passwordEncoder.encode(password);

        User user = new User(userName, newPassword, email, firstName, lastName, avatar, User.Role.USER);

        return userDao.save(user);
    }

    @Override
    public UserAllergy addUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException, DuplicateInstanceException {

        User user = permissionChecker.checkUserExists(userId);

        Allergy allergy = permissionChecker.checkAllergyExists(allergyId);

        if(userAllergyDao.existsByUserIdAndAllergyId(userId, allergyId)){
            throw new DuplicateInstanceException("project.entities.userallergy", "(" + userId + ", " + allergyId + ")");
        }

        UserAllergy userAllergy = new UserAllergy(user, allergy);

        userAllergyDao.save(userAllergy);

        return userAllergy;
    }

    @Override
    public UserAllergy getUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException {
        return permissionChecker.checkUserAllergyExists(userId, allergyId);
    }

    @Override
    public void removeUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException {

        permissionChecker.checkUserExists(userId);

        permissionChecker.checkAllergyExists(allergyId);

        UserAllergyId userAllergyId = new UserAllergyId(userId, allergyId);

        if(!userAllergyDao.existsByUserIdAndAllergyId(userId, allergyId)){
            throw new InstanceNotFoundException("project.entities.userallergy", "(" + userId + ", " + allergyId + ")");
        }

        userAllergyDao.deleteById(userAllergyId);
    }

    @Override
    public User login(String userName, String password) throws IncorrectLoginException {

        Optional<User> user = userDao.findByUserName(userName);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(userName, password);
		}

		return user.get();

        
    }

    @Override
    @Transactional(readOnly=true)
    public User loginFromId(Long id) throws InstanceNotFoundException {
        return permissionChecker.checkUserExists(id);
    }

    @Override
    public List<User> findUsersByAllergies(Long userId, Long productId) throws InstanceNotFoundException {

        Product product = permissionChecker.checkProductExists(productId);

        Long householdId = product.getHousehold().getId();

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        List<Long> allergyIds = productAllergyDao.findAllergyIdsByProductId(productId);

        return userAllergyDao.findUsersByAllergies(allergyIds, householdId);
    }

    @Override
    public List<User> findUsersByAllergyIds(Long userId, Long householdId, List<Long> allergyIds) throws InstanceNotFoundException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        if (allergyIds == null || allergyIds.isEmpty()) {
            return List.of();
        }

        return userAllergyDao.findUsersByAllergies(allergyIds, householdId);
    }

}
