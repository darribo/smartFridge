package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.Household;

public interface HouseholdDao extends JpaRepository<Household, Long> {

    boolean existsByAdminIdAndName(Long userId, String name);

}
