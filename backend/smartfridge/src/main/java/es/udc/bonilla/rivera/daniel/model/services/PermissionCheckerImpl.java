package es.udc.bonilla.rivera.daniel.model.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.ProductItemDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserAllergyDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserHouseholdDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.ProductAllergyId;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
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
    private ProductDao productDao;

    @Autowired
    private ProductItemDao productItemDao;

    @Autowired
    private ProductAllergyDao productAllergyDao;

    @Autowired
    private UserAllergyDao userAllergyDao;

    @Autowired
    private UserHouseholdDao userHouseholdDao;

    /* @Autowired
    private HouseholdInvitationDao householdInvitationDao; */

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
    public Product checkProductExists(Long productId) throws InstanceNotFoundException {

        Optional<Product> optional = productDao.findById(productId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.product", productId);
        }

        return optional.get();
    }

    @Override
    public Product checkProductExistsInHousehold(Long productId, Long householdId) throws InstanceNotFoundException {

        Optional<Product> optional = productDao.findByIdAndHouseholdId(productId, householdId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.product", "(" + productId + ", " + householdId + ")");
        }

        return optional.get();
    }

    @Override
    public ProductItem checkProductItemExists(Long productItemId) throws InstanceNotFoundException {

        Optional<ProductItem> optional = productItemDao.findById(productItemId);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.productitem", productItemId);
        }

        return optional.get();
    }

    @Override
    public ProductAllergy checkProductAllergyExists(Long productId, Long allergyId) throws InstanceNotFoundException {

        Optional<ProductAllergy> optional = productAllergyDao.findById(new ProductAllergyId(productId, allergyId));

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.productallergy", "(" + productId + ", " + allergyId + ")");
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
    public Product checkProductBelongsToUserHousehold(Long productId, Long userId) throws InstanceNotFoundException {

        Product product = checkProductExists(productId);
        Long householdId = product.getHousehold().getId();

        Optional<UserHousehold> optional = userHouseholdDao.findById(new UserHouseholdId(userId, householdId));

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.product", productId);
        }

        return product;
    }

    @Override
    public UserHousehold checkUserHouseholdExists(Long userId, Long householdId) throws InstanceNotFoundException {
        
        Optional<UserHousehold> optional = userHouseholdDao.findById(new UserHouseholdId(userId, householdId));

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.userhousehold", "(" + userId + ", " + householdId + ")");
        }

        return optional.get();
    }

    /* @Override
    public HouseholdInvitation checkHouseholdInvitationExists(Long householdInvitationId) throws InstanceNotFoundException {
        
        Optional<HouseholdInvitation> optional = householdInvitationDao.findByIdAndStatus(householdInvitationId, HouseholdInvitation.Status.PENDING);

        if (!optional.isPresent()) {
            throw new InstanceNotFoundException("project.entities.householdinvitation", householdInvitationId);
        }

        return optional.get();
    } */

}
