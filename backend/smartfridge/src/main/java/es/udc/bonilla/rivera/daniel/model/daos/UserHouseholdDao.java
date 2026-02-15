package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.entities.UserHouseholdId;

public interface UserHouseholdDao extends JpaRepository<UserHousehold, UserHouseholdId>{

    boolean existsByUserIdAndHouseholdId(Long userId, Long householdId);

}
