package es.udc.bonilla.rivera.daniel.model.services;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.common.PermissionException;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserHouseholdDao;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.entities.UserHouseholdId;

@Service
@Transactional
public class HouseholdServiceImpl implements HouseholdService {

    @Autowired
    private UserHouseholdDao userHouseholdDao;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private HouseholdDao householdDao;

    /* @Autowired
    private HouseholdInvitationDao householdInvitationDao; */

    @Override
    public Household createHousehold(Long userId, String name, String description, String countryCode, String regionCode, String regionName) throws InstanceNotFoundException, DuplicateInstanceException {
        
        User admin = permissionChecker.checkUserExists(userId);

        if (householdDao.existsByAdminIdAndName(userId, name)) {
            throw new DuplicateInstanceException("project.entities.household", String.format("(%d, %s)", userId, name));
        }

        Household household = new Household(name, description, countryCode, regionCode, regionName, admin);

        household = householdDao.save(household);

        addUserHousehold(userId, household.getId());

        return household;
    }

    @Override
    public Household updateHousehold(Long householdId, Long userId, String name, String description, String countryCode, String regionCode, String regionName) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        
        User user = permissionChecker.checkUserExists(userId);

        Household household = permissionChecker.checkHouseholdExists(householdId);

        //Si el usuario que intenta actualizar el household no es su admin
        if (!Objects.equals(user.getId(), household.getAdmin().getId())){
            throw new PermissionException();
        }

        //Si se intenta cambiar el nombre y ese admin ya tiene uno con ese nombre
        if ((household.getName() == null ? name != null : !household.getName().equals(name)) && householdDao.existsByAdminIdAndName(userId, name)){
            throw new DuplicateInstanceException("project.entities.household", String.format("(%d, %s)", userId, name));
        }

        household.setName(name);
        household.setDescription(description);
        household.setCountryCode(countryCode);
        household.setRegionCode(regionCode);
        household.setRegionName(regionName);

        return household;
    }

    @Override
    public Household getHousehold(Long userId, Long householdId) throws InstanceNotFoundException{

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        return permissionChecker.checkHouseholdExists(householdId);
    }

    @Override
    public Household changeAdmin(Long currentAdminId, Long newAdminId, Long householdId) throws InstanceNotFoundException, PermissionException {
        
        User currentAdmin = permissionChecker.checkUserExists(currentAdminId);
        User newAdmin = permissionChecker.checkUserExists(newAdminId);
        Household household = permissionChecker.checkHouseholdExists(householdId);

        if (!Objects.equals(household.getAdmin().getId(), currentAdmin.getId())){
            throw new PermissionException();
        }

        if(!userHouseholdDao.existsByUserIdAndHouseholdId(newAdminId, householdId)){
            throw new InstanceNotFoundException("project.entities.userhousehold", "(" + newAdminId + ", " + householdId + ")");
        }

        household.setAdmin(newAdmin);

        return household;
    }

    @Override
    public void removeHousehold(Long adminId, Long householdId) throws InstanceNotFoundException, PermissionException {
        
        User user = permissionChecker.checkUserExists(adminId);
        Household household = permissionChecker.checkHouseholdExists(householdId);

        if (!Objects.equals(household.getAdmin().getId(), user.getId())){
            throw new PermissionException();
        }

        householdDao.delete(household);
    }

    /* @Override
    public HouseholdInvitation sendHouseholdInvitation(Long hostId, Long guestId, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException {
        
        User host = permissionChecker.checkUserExists(hostId);
        User guest = permissionChecker.checkUserExists(guestId);
        Household household = permissionChecker.checkHouseholdExists(householdId);

        //No se puede enviar invitación a sí mismo ni enviarla si no es el admin del hogar
        if(Objects.equals(host.getId(), guest.getId()) || !Objects.equals(host.getId(), household.getAdmin().getId())){
            throw new PermissionException();
        }

        //Si ya se ha mandado la petición y está pendiente o está aceptada
        if (householdInvitationDao.existsByHostIdAndGuestIdAndStatus(host.getId(), guest.getId(), HouseholdInvitation.Status.ACCEPTED) ||
            householdInvitationDao.existsByHostIdAndGuestIdAndStatus(host.getId(), guest.getId(), HouseholdInvitation.Status.PENDING)){
            throw new DuplicateInstanceException("project.entities.householdinvitation", String.format("(%d, %s)", hostId, guestId));
        }

        HouseholdInvitation householdInvitation = new HouseholdInvitation(household, host, guest, LocalDateTime.now().withNano(0), null, HouseholdInvitation.Status.PENDING);

        return householdInvitationDao.save(householdInvitation);
    } */

    /* @Override
    public UserHousehold acceptInvitation(Long guestId, Long householdInvitationId) throws InstanceNotFoundException, DuplicateInstanceException {
        
        HouseholdInvitation householdInvitation = permissionChecker.checkHouseholdInvitationExists(householdInvitationId);

        //Se manda instancia no encontrada para no revelar que no hay una invitación con ese id (se protege la información)
        if(!Objects.equals(householdInvitation.getGuest().getId(), guestId)){
            throw new InstanceNotFoundException("project.entities.householdinvitation", householdInvitationId);
        }

        UserHousehold userHousehold = addUserHousehold(guestId, householdInvitation.getHousehold().getId());

        householdInvitation.setStatus(HouseholdInvitation.Status.ACCEPTED);
        householdInvitation.setResponseDate(LocalDateTime.now().withNano(0));

        return userHousehold;
    } */

    /*@ Override
    public HouseholdInvitation rejectInvitation(Long guestId, Long householdInvitationId) throws InstanceNotFoundException {
        
        HouseholdInvitation householdInvitation = permissionChecker.checkHouseholdInvitationExists(householdInvitationId);

        //Se manda instancia no encontrada para no revelar que no hay una invitación con ese id (se protege la información)
        if(!Objects.equals(householdInvitation.getGuest().getId(), guestId)){
            throw new InstanceNotFoundException("project.entities.householdinvitation", householdInvitationId);
        }

        householdInvitation.setStatus(HouseholdInvitation.Status.REJECTED);
        householdInvitation.setResponseDate(LocalDateTime.now().withNano(0));

        return householdInvitation;
    } */

    @Override
    public UserHousehold addUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException {

        User user = permissionChecker.checkUserExists(userId);

        Household household = permissionChecker.checkHouseholdExists(householdId);

        if(userHouseholdDao.existsByUserIdAndHouseholdId(userId, householdId)){
            throw new DuplicateInstanceException("project.entities.userhousehold", String.format("(%d, %s)", userId, householdId));
        }

        UserHousehold userHousehold = new UserHousehold(user, household, LocalDateTime.now().withNano(0));

        userHouseholdDao.save(userHousehold);

        return userHousehold;
        
    }

    @Override
    public UserHousehold getUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException {
        return permissionChecker.checkUserHouseholdExists(userId, householdId);
    }

    @Override
    public void leaveHousehold(Long userId, Long householdId) throws InstanceNotFoundException {
        
        User user = permissionChecker.checkUserExists(userId);

        Household household = permissionChecker.checkHouseholdExists(householdId);

        UserHouseholdId userHouseholdId = new UserHouseholdId(userId, householdId);

        if(!userHouseholdDao.existsByUserIdAndHouseholdId(userId, householdId)){
            throw new InstanceNotFoundException("project.entities.userhousehold", "(" + userId + ", " + householdId + ")");
        }

        //Si el que se va es el admin hay darle el admin a otro (al más antiguo del hogar). Si el que se va es el último hay que borrar hogar.
        if(Objects.equals(household.getAdmin().getId(), user.getId())){
            
            Optional<User> older = userHouseholdDao.findOldestNonAdminMember(householdId);

            //Si ya no queda nadie y el admin se va, se borra el hogar directamente
            if(older.isEmpty()){
                householdDao.delete(household);
            }

            //Si aún quedan usuarios en el hogar, el admin se va y el nuevo admin será el más antigup
            else {
                household.setAdmin(older.get());
                userHouseholdDao.deleteById(userHouseholdId);
            }
        }

        else{
            userHouseholdDao.deleteById(userHouseholdId);
        }
    }

    /**
     * Devuelve los hogares a los que pertenece el usuario usando paginación por slices.
     */
    @Override
    public Block<Household> getUserHouseholds(Long userId, int page, int size) {
        
        Slice<Household> slice = userHouseholdDao.findUserHouseholds(userId, PageRequest.of(page, size));

        return new Block<>(slice.getContent(), slice.hasNext());
    }

    /**
     * Devuelve de forma paginada los miembros de un hogar cuando el solicitante pertenece al mismo.
     */
    @Override
    public Block<User> getHouseholdMembers(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException {
        
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<User> slice = userHouseholdDao.findHouseholdMembers(householdId, PageRequest.of(page, size));

        return new Block<>(slice.getContent(), slice.hasNext());
    }

    /**
     * Cuenta los miembros de un hogar cuando el solicitante pertenece al mismo.
     */
    @Override
    public int getHouseholdMembersNumber(Long userId, Long householdId) throws InstanceNotFoundException {
        
        permissionChecker.checkUserHouseholdExists(userId, householdId);

        return userHouseholdDao.countByHousehold_Id(householdId);
    }

    /* @Override
    public Block<HouseholdInvitation> getHouseholdPendingInvitations(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException {

        permissionChecker.checkUserHouseholdExists(userId, householdId);

        Slice<HouseholdInvitation> slice = householdInvitationDao.findByHouseholdIdAndStatusOrderBySendingDateDesc(householdId, HouseholdInvitation.Status.PENDING, PageRequest.of(page, size));

        return new Block<>(slice.getContent(), slice.hasContent());
    } */

}
