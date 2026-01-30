package es.udc.bonilla.rivera.daniel.model.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

@Service
@Transactional(readOnly = true)
public class AllergyServiceImpl implements AllergyService {

    @Autowired
    private PermissionChecker permissionChecker;

    @Override
    public Allergy getAllergy(Long allergyId) throws InstanceNotFoundException {
        return permissionChecker.checkAllergyExists(allergyId);
    }

}
