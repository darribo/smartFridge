package es.udc.bonilla.rivera.daniel.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.UserAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserHouseholdDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergyId;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.entities.UserHouseholdId;
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
    private UserHouseholdDao userHouseholdDao;

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
    public UserHousehold addUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException {

        User user = permissionChecker.checkUserExists(userId);

        Household household = permissionChecker.checkHouseholdExists(householdId);

        if(userHouseholdDao.existsByUserIdAndHouseholdId(userId, householdId)){
            throw new DuplicateInstanceException("project.entities.userhousehold", "(" + userId + ", " + householdId + ")");
        }

        UserHousehold userHousehold = new UserHousehold(user, household);

        userHouseholdDao.save(userHousehold);

        return userHousehold;
        
    }

    @Override
    public UserHousehold getUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException {
        return permissionChecker.checkUserHouseholdExists(userId, householdId);
    }

    @Override
    public void removeUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException {
        
        permissionChecker.checkUserExists(userId);

        permissionChecker.checkHouseholdExists(householdId);

        UserHouseholdId userHouseholdId = new UserHouseholdId(userId, householdId);

        if(!userHouseholdDao.existsByUserIdAndHouseholdId(userId, householdId)){
            throw new InstanceNotFoundException("project.entities.userhousehold", "(" + userId + ", " + householdId + ")");
        }

        userHouseholdDao.deleteById(userHouseholdId);
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

}
