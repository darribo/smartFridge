package es.udc.bonilla.rivera.daniel.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
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

@Service
@Transactional(readOnly = true)
public class PermissionCheckerImpl implements PermissionChecker {

    @Autowired
    private UserDao userDao;

    @Autowired
    private AllergyDao allergyDao;

    @Autowired
    private HouseholdDao householdDao;

    @Autowired
    private UserAllergyDao userAllergyDao;

    @Autowired
    private UserHouseholdDao userHouseholdDao;

    @Override
    public User checkUserExists(Long userId) throws InstanceNotFoundException {

        Optional<User> optional = userDao.findById(userId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        return optional.get();
    }

    @Override
    public Allergy checkAllergyExists(Long allergyId) throws InstanceNotFoundException {

        Optional<Allergy> optional = allergyDao.findById(allergyId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.allergy", allergyId);
        }

        return optional.get();
    }

    @Override
    public Household checkHouseholdExists(Long householdId) throws InstanceNotFoundException {

        Optional<Household> optional = householdDao.findById(householdId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.household", householdId);
        }

        return optional.get();
    }

    @Override
    public UserAllergy checkUserAllergyExists(Long userId, Long allergyId) throws InstanceNotFoundException {

        Optional<UserAllergy> optional = userAllergyDao.findById(new UserAllergyId(userId, allergyId));

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.userallergy", "(" + userId + ", " + allergyId + ")");
        }

        return optional.get();
    }

    @Override
    public UserHousehold checkUserHouseholdExists(Long userId, Long householdId) throws InstanceNotFoundException {
        
        Optional<UserHousehold> optional = userHouseholdDao.findById(new UserHouseholdId(userId, householdId));

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.userhousehold", "(" + userId + ", " + householdId + ")");
        }

        return optional.get();
    }

}