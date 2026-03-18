package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergyId;

public interface UserAllergyDao extends JpaRepository<UserAllergy, UserAllergyId>{

    boolean existsByUserIdAndAllergyId(Long userId, Long allergyId);

    @Query("SELECT DISTINCT ua.user FROM UserAllergy ua WHERE ua.allergy.id IN :allergyIds AND ua.user in (SELECT uh.user FROM UserHousehold uh WHERE uh.household.id = :householdId)")
    List<User> findUsersByAllergies(List<Long> allergyIds, Long householdId);

}
