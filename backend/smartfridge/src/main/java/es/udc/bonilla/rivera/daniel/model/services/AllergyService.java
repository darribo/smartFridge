package es.udc.bonilla.rivera.daniel.model.services;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

public interface AllergyService {

    /**
     * Obtiene una alergia concreta por su identificador.
     *
     * @param allergyId Identificador único de la alergia.
     * @return La entidad {@code Allergy} correspondiente.
     * @throws InstanceNotFoundException Si no se encuentra la alergia indicada.
     */
    Allergy getAllergy(Long allergyId) throws InstanceNotFoundException;

    /**
     * Devuelve un bloque paginado con todas las alergias, ordenadas por tag ascendente.
     *
     * @param page Índice de página (base 0).
     * @param size Número de elementos por página.
     * @return Un {@code Block} con las alergias de la página solicitada y si existen más elementos.
     */
    Block<Allergy> getAllAlergies(int page, int size);

}
