package es.udc.bonilla.rivera.daniel.model.services;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IncorrectLoginException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IncorrectPasswordException;

public interface UserService {


    /**
     * Registra un nuevo usuario en el sistema con las credenciales y la información del perfil proporcionada.
     *
     * @param userName  el nombre de usuario para la nueva cuenta
     * @param password  la contraseña para la nueva cuenta
     * @param email     la dirección de correo electrónico asociada con la cuenta
     * @param firstName el nombre del usuario
     * @param lastName  el apellido del usuario
     * @param avatar    la imagen o identificador del avatar del perfil del usuario
     * @throws DuplicateInstanceException si el nombre de usuario o el correo electrónico ya están en uso
     */
    User signUp(String userName, String password, String email, String firstName, String lastName, String avatar) throws DuplicateInstanceException;

    /**
     * Añade una alergia a un usuario específico.
     *
     * @param userId Identificador único del usuario al que se le añadirá la alergia.
     * @param allergyId Identificador único de la alergia que se desea asociar al usuario.
     * @return La entidad {@code UserAllergy} que representa la relación creada entre el usuario y la alergia.
     * @throws InstanceNotFoundException Si no se encuentra el usuario o la alergia especificados.
     * @throws DuplicateInstanceException Si la relación entre el usuario y la alergia ya existe.
     */
    UserAllergy addUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException, DuplicateInstanceException;

    UserAllergy getUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException;

    /**
     * Elimina una alergia específica del usuario indicado.
     *
     * @param userId Identificador único del usuario al que se le eliminará la alergia.
     * @param allergyId Identificador único de la alergia que se desea eliminar del usuario.
     * @throws InstanceNotFoundException Si no se encuentra el usuario o la alergia especificada.
     */
    void removeUserAllergy(Long userId, Long allergyId) throws InstanceNotFoundException;

    /**
     * Autentica a un usuario con su nombre de usuario y contraseña.
     *
     * @param userName Nombre de usuario.
     * @param password Contraseña del usuario.
     * @return La entidad {@code User} autenticada.
     * @throws IncorrectLoginException Si las credenciales son incorrectas.
     */
    User login(String userName, String password) throws IncorrectLoginException;

    /**
     * Recupera el usuario autenticado a partir de su identificador.
     *
     * @param id Identificador único del usuario.
     * @return La entidad {@code User} correspondiente.
     * @throws InstanceNotFoundException Si no se encuentra el usuario indicado.
     */
    User loginFromId(Long id) throws InstanceNotFoundException;

    List<User> findUsersByAllergies(Long userId, Long productId) throws InstanceNotFoundException;

    List<User> findUsersByAllergyIds(Long userId, Long householdId, List<Long> allergyIds) throws InstanceNotFoundException;

    User updateProfile(Long userId, String firstName, String lastName) throws InstanceNotFoundException;

    User updateAvatar(Long userId, MultipartFile file) throws InstanceNotFoundException, IOException;

    void changePassword(Long userId, String oldPassword, String newPassword) throws InstanceNotFoundException, IncorrectPasswordException;

}
