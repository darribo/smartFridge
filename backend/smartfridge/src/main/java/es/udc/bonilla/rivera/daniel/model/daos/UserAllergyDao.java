package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.UserAllergy;
import es.udc.bonilla.rivera.daniel.model.entities.UserAllergyId;

public interface UserAllergyDao extends JpaRepository<UserAllergy, UserAllergyId>{

    boolean existsByUserIdAndAllergyId(Long userId, Long allergyId);

}
