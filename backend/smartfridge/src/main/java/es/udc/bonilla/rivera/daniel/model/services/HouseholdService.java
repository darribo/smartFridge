package es.udc.bonilla.rivera.daniel.model.services;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.common.OptimisticLockingException;
import es.udc.bonilla.rivera.daniel.model.common.PermissionException;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;

public interface HouseholdService {

    /**
     * Crea un nuevo hogar administrado por el usuario indicado.
     * Además, registra automáticamente al administrador como miembro del hogar creado.
     *
     * @param userId Identificador único del usuario que será administrador del hogar.
     * @param name Nombre del hogar.
     * @param description Descripción del hogar.
     * @param countryCode Código del país del hogar.
     * @param regionCode Código de la región del hogar.
     * @param regionName Nombre de la región del hogar.
     * @return La entidad {@code Household} creada.
     * @throws InstanceNotFoundException Si no se encuentra el usuario administrador.
     * @throws DuplicateInstanceException Si el administrador ya tiene un hogar con el mismo nombre.
     */
    Household createHousehold(Long userId, String name, String description, String countryCode, String regionCode, String regionName) throws InstanceNotFoundException, DuplicateInstanceException;

    Household getHousehold(Long userId, Long householdId) throws InstanceNotFoundException;

    /**
     * Actualiza la información de un hogar.
     *
     * @param householdId Identificador único del hogar a actualizar.
     * @param userId Identificador del usuario que realiza la operación.
     * @param name Nuevo nombre del hogar.
     * @param description Nueva descripción del hogar.
     * @param countryCode Nuevo código de país.
     * @param regionCode Nuevo código de región.
     * @param regionName Nuevo nombre de región.
     * @return La entidad {@code Household} actualizada.
     * @throws InstanceNotFoundException Si no se encuentra el usuario o el hogar.
     * @throws DuplicateInstanceException Si el nuevo nombre ya existe en otro hogar del mismo administrador.
     * @throws PermissionException Si el usuario no es el administrador del hogar.
     */
    Household updateHousehold(Long householdId, Long userId, Long version, String name, String description, String countryCode, String regionCode, String regionName) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException, OptimisticLockingException;

    void removeHouseholdMember(Long adminId, Long memberId, Long householdId) throws InstanceNotFoundException, PermissionException;

    /**
     * Cambia el administrador de un hogar.
     *
     * @param currentAdminId Identificador del administrador actual.
     * @param newAdminId Identificador del nuevo administrador.
     * @param householdId Identificador del hogar.
     * @return La entidad {@code Household} con el nuevo administrador.
     * @throws InstanceNotFoundException Si no se encuentra alguno de los usuarios, el hogar
     * o la relación de pertenencia del nuevo administrador con el hogar.
     * @throws PermissionException Si el usuario actual no es administrador del hogar.
     */
    Household changeAdmin(Long currentAdminId, Long newAdminId, Long householdId) throws InstanceNotFoundException, PermissionException;

    /**
     * Elimina un hogar del sistema.
     *
     * @param adminId Identificador del usuario que solicita la eliminación.
     * @param householdId Identificador del hogar a eliminar.
     * @throws InstanceNotFoundException Si no se encuentra el usuario o el hogar.
     * @throws PermissionException Si el usuario no es el administrador del hogar.
     */
    void removeHousehold(Long adminId, Long householdId) throws InstanceNotFoundException, PermissionException;

    
    /* HouseholdInvitation sendHouseholdInvitation(Long hostId, Long guestId, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException, PermissionException; */

    /* UserHousehold acceptInvitation(Long guestId, Long householdInvitationId) throws InstanceNotFoundException, DuplicateInstanceException; */

    /* HouseholdInvitation rejectInvitation(Long guestId, Long householdInvitationId) throws InstanceNotFoundException; */



    /**
     * Añade un usuario a un hogar específico.
     *
     * @param userId        Identificador único del usuario que se desea añadir.
     * @param householdId   Identificador único del hogar al que se añadirá el usuario.
     * @return              La relación creada entre el usuario y el hogar.
     * @throws InstanceNotFoundException   Si no se encuentra el usuario o el hogar especificado.
     * @throws DuplicateInstanceException  Si el usuario ya pertenece al hogar indicado.
     */
    UserHousehold addUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException, DuplicateInstanceException;

    /**
     * Recupera la relación entre un usuario y un hogar.
     *
     * @param userId Identificador único del usuario.
     * @param householdId Identificador único del hogar.
     * @return La entidad {@code UserHousehold} correspondiente.
     * @throws InstanceNotFoundException Si no existe la relación usuario-hogar para los identificadores indicados.
     */
    UserHousehold getUserHousehold(Long userId, Long householdId) throws InstanceNotFoundException;

    /**
     * Elimina la relación de pertenencia de un usuario a un hogar.
     * Si el usuario es administrador, se transfiere la administración al miembro más antiguo o se elimina el hogar si no quedan miembros.
     *
     * @param userId Identificador del usuario que abandona el hogar.
     * @param householdId Identificador del hogar.
     * @throws InstanceNotFoundException Si no se encuentra el usuario, el hogar o la relación usuario-hogar a eliminar.
     */
    void leaveHousehold(Long userId, Long householdId) throws InstanceNotFoundException;

    /**
     * Recupera de forma paginada los hogares a los que pertenece un usuario.
     *
     * @param userId Identificador del usuario.
     * @param page Índice de página (base 0).
     * @param size Tamaño máximo de elementos por página.
     * @return Bloque paginado con los hogares del usuario y flag de existencia de más elementos.
     */
    Block<Household> getUserHouseholds(Long userId, int page, int size);

    /**
     * Recupera de forma paginada los miembros de un hogar.
     * El usuario solicitante debe pertenecer al hogar.
     *
     * @param userId Identificador del usuario que solicita la información.
     * @param householdId Identificador del hogar.
     * @param page Índice de página (base 0).
     * @param size Tamaño máximo de elementos por página.
     * @return Bloque paginado con los usuarios miembros del hogar.
     * @throws InstanceNotFoundException Si el usuario no pertenece al hogar.
     */
    Block<User> getHouseholdMembers(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException;

    /**
     * Obtiene el número total de miembros de un hogar.
     * El usuario solicitante debe pertenecer al hogar.
     *
     * @param userId Identificador del usuario que solicita la información.
     * @param householdId Identificador del hogar.
     * @return Número total de miembros del hogar.
     * @throws InstanceNotFoundException Si el usuario no pertenece al hogar.
     */
    int getHouseholdMembersNumber(Long userId, Long householdId) throws InstanceNotFoundException;

    
    
    /* Block<HouseholdInvitation> getHouseholdPendingInvitations(Long userId, Long householdId, int page, int size) throws InstanceNotFoundException; */

}
