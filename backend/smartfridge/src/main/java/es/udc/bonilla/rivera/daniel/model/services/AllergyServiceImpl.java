package es.udc.bonilla.rivera.daniel.model.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

@Service
@Transactional(readOnly = true)
public class AllergyServiceImpl implements AllergyService {

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private AllergyDao allergyDao;

    @Override
    public Allergy getAllergy(Long allergyId) throws InstanceNotFoundException {
        return permissionChecker.checkAllergyExists(allergyId);
    }

    @Override
    public Block<Allergy> getAllAlergies(int page, int size) {

        Slice<Allergy> slice = allergyDao.findAll(PageRequest.of(page, size, Sort.by("tag").ascending()));
    
        return new Block<>(slice.getContent(), slice.hasNext());
    }

}
