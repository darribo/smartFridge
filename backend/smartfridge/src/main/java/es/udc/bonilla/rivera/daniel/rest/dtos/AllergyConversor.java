package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import es.udc.bonilla.rivera.daniel.model.entities.Allergy;

@Component
public class AllergyConversor {

    @Autowired
    private MessageSource messageSource;

    public AllergyDto toAllergyDto (Allergy allergy, Locale locale) {

        String[] parts = allergy.getTag().split(":");
        String icon = parts[1];

        String name = messageSource.getMessage(
            "allergy." + icon + ".name",
            null,
            locale
        );

        String description = messageSource.getMessage(
            "allergy." + icon + ".description",
            null,
            locale
        );

        return new AllergyDto(allergy.getId(), name, description, allergy.getTag(), icon);
    }

    public List<AllergyDto> toAllergyDtos(List<Allergy> allergies, Locale locale){
        
        List<AllergyDto> dtos = new ArrayList<>();

        for(Allergy allergy : allergies){
            dtos.add(toAllergyDto(allergy, locale));
        }

        return dtos;
    }

}
