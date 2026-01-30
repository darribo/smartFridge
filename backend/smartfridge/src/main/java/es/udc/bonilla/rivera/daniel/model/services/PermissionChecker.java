package es.udc.bonilla.rivera.daniel.model.services;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;

public interface PermissionChecker {

    User checkUserExists(Long userId) throws InstanceNotFoundException;

    Allergy checkAllergyExists(Long allergyId) throws InstanceNotFoundException;

    Household checkHouseholdExists(Long householdId) throws InstanceNotFoundException;

    UserAllergy checkUserAllergyExists(Long userId, Long allergyId) throws InstanceNotFoundException;

    UserHousehold checkUserHouseholdExists(Long userId, Long householdId) throws InstanceNotFoundException;

}
