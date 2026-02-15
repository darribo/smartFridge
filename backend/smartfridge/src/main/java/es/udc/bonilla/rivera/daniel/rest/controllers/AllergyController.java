package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.udc.bonilla.rivera.daniel.model.entities.Allergy;
import es.udc.bonilla.rivera.daniel.model.services.AllergyService;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.rest.dtos.AllergyConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.AllergyDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


@Tag(
    name = "Alergias",
    description = "Operaciones relacionadas con el catálogo de alergias del sistema."
)
@RestController
@RequestMapping("/allergies")
public class AllergyController {

    @Autowired
    private AllergyService allergyService;

    @Autowired
    private AllergyConversor allergyConversor;

    private static final int SIZE_NUMBER = 5;

    @Operation(
        summary = "Obtener el catálogo de alergias",
        description = "Devuelve una lista paginada de alergias con información localizada según el idioma de la petición."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado de alergias",
            content = @Content(schema = @Schema(implementation = BlockDto.class)))
    })
    @GetMapping("/getAll")
    public BlockDto<AllergyDto> getAllAllergies(@RequestParam(defaultValue = "0") int page, Locale locale) {

        Block<Allergy> allergies = allergyService.getAllAlergies(page, SIZE_NUMBER);

        return new BlockDto<>(allergyConversor.toAllergyDtos(allergies.getItems(), locale), allergies.getExistMoreItems());
        
    }
    

}
