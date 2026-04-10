package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.RecipeService;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.NewRecipeParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.RecipeConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.RecipeDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.RecipeSummaryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Recetas", description = "Gestión de recetas de cocina")
@RestController
@RequestMapping("/recipes")
public class RecipeController {

    private static final String INSTANCE_NOT_FOUND_EXCEPTION_CODE = "project.exceptions.InstanceNotFoundException";

    private static final int size = 5;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private MessageSource messageSource;

    @ExceptionHandler(InstanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ErrorsDto handleInstanceNotFoundException(InstanceNotFoundException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INSTANCE_NOT_FOUND_EXCEPTION_CODE, null,
                INSTANCE_NOT_FOUND_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @Operation(
        summary = "Crear una receta",
        description = "Crea una nueva receta con sus ingredientes para el usuario autenticado."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Receta creada",
            content = @Content(schema = @Schema(implementation = RecipeDto.class))),
        @ApiResponse(responseCode = "404", description = "Usuario o producto vinculado no encontrado",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class))),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeDto createRecipe(@RequestAttribute Long userId,
            @Validated @RequestBody NewRecipeParamsDto params) throws InstanceNotFoundException {

        Recipe recipe = recipeService.createRecipe(userId, params);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipe.getId());

        return RecipeConversor.toRecipeDto(recipe, ingredients);
    }

    @Operation(
        summary = "Obtener detalle de una receta",
        description = "Devuelve la información completa de una receta junto con sus ingredientes."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detalle de la receta",
            content = @Content(schema = @Schema(implementation = RecipeDto.class))),
        @ApiResponse(responseCode = "404", description = "Receta no encontrada",
            content = @Content(schema = @Schema(implementation = ErrorsDto.class)))
    })
    @GetMapping("/{recipeId}")
    public RecipeDto getRecipe(@RequestAttribute Long userId,
            @PathVariable Long recipeId) throws InstanceNotFoundException {

        Recipe recipe = recipeService.getRecipe(userId, recipeId);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipeId);

        return RecipeConversor.toRecipeDto(recipe, ingredients);
    }

    @GetMapping
    public BlockDto<RecipeSummaryDto> findRecipes(
            @RequestAttribute Long userId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer minMinutes,
            @RequestParam(required = false) Integer maxMinutes,
            @RequestParam(required = false) Recipe.Difficulty difficulty,
            @RequestParam(required = false) Recipe.MealType mealType,
            @RequestParam(required = false) Recipe.CuisineType cuisineType,
            @RequestParam(required = false) Recipe.DietType dietType,
            @RequestParam(required = false) Recipe.SeasonType seasonType,
            @RequestParam(required = false) Boolean isVegetarian,
            @RequestParam(required = false) Boolean isVegan,
            @RequestParam(required = false) List<Long> productIds,
            @RequestParam(defaultValue = "0") int page) throws InstanceNotFoundException {

        Block<Recipe> block = recipeService.findRecipesByUser(userId, title, minMinutes, maxMinutes,
                difficulty, mealType, cuisineType, dietType, seasonType, isVegetarian, isVegan, productIds, page, size);

        List<RecipeSummaryDto> dtos = block.getItems().stream()
                .map(RecipeConversor::toRecipeSummaryDto)
                .toList();

        return new BlockDto<>(dtos, block.getExistMoreItems());
    }

}
