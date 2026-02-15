package es.udc.bonilla.rivera.daniel.model.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.daos.AllergyDao;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AllergyServiceTest {

    private static final Long NON_EXISTING_ID = 999L;

    @Autowired
    private AllergyService allergyService;

    @Autowired
    private AllergyDao allergyDao;

    private Allergy createAllergy(String tag) {
        Allergy allergy = new Allergy(tag);
        return allergyDao.save(allergy);
    }

    @Test
    void getAllergyValid() throws Exception {

        Allergy allergy = createAllergy("GLUTEN");

        Allergy found = allergyService.getAllergy(allergy.getId());

        assertNotNull(found);
        assertEquals(allergy.getId(), found.getId());
        assertEquals("GLUTEN", found.getTag());
    }

    @Test
    void getAllergyWithANonExistingId() {
        assertThrows(InstanceNotFoundException.class, () -> allergyService.getAllergy(NON_EXISTING_ID));
    }

    @Test
    void getAllAlergiesReturnsOrderedAndPaged() {

        createAllergy("B");
        createAllergy("A");
        createAllergy("C");

        Block<Allergy> firstPage = allergyService.getAllAlergies(0, 2);

        List<Allergy> firstItems = firstPage.getItems();
        assertEquals(2, firstItems.size());
        assertEquals("A", firstItems.get(0).getTag());
        assertEquals("B", firstItems.get(1).getTag());
        assertEquals(true, firstPage.getExistMoreItems());

        Block<Allergy> secondPage = allergyService.getAllAlergies(1, 2);

        List<Allergy> secondItems = secondPage.getItems();
        assertEquals(1, secondItems.size());
        assertEquals("C", secondItems.get(0).getTag());
        assertEquals(false, secondPage.getExistMoreItems());
    }
}
