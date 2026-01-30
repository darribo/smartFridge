package es.udc.bonilla.rivera.daniel.model.services;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

public interface AllergyService {

    Allergy getAllergy(Long allergyId) throws InstanceNotFoundException;

}
