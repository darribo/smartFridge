package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

public interface AllergyDao extends JpaRepository<Allergy, Long> {

}
