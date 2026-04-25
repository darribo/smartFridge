package es.udc.bonilla.rivera.daniel.rest.controllers;

import java.util.List;
import java.util.Locale;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;
import es.udc.bonilla.rivera.daniel.model.services.Block;
import es.udc.bonilla.rivera.daniel.model.services.CookRecipePreview;
import es.udc.bonilla.rivera.daniel.model.services.LlmService;
import es.udc.bonilla.rivera.daniel.model.services.RecipeService;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.DietaryConflictException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.IngredientUnitMismatchException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InsufficientStockException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.InvalidProductItemTransactionException;
import es.udc.bonilla.rivera.daniel.model.services.exceptions.LlmServiceException;
import es.udc.bonilla.rivera.daniel.rest.common.ErrorsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.BlockDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.CookedRecipeConversor;
import es.udc.bonilla.rivera.daniel.rest.dtos.CookedRecipeDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.CookRecipeParamsDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.CookRecipePreviewDto;
import es.udc.bonilla.rivera.daniel.rest.dtos.GenerateAiRecipeParamsDto;
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
    private static final String LLM_SERVICE_EXCEPTION_CODE = "project.exceptions.LlmServiceException";
    private static final String DIETARY_CONFLICT_VEGETARIAN_CODE = "project.exceptions.DietaryConflictException.VEGETARIAN";
    private static final String DIETARY_CONFLICT_VEGAN_CODE = "project.exceptions.DietaryConflictException.VEGAN";
    private static final String INGREDIENT_UNIT_MISMATCH_CODE = "project.exceptions.IngredientUnitMismatchException";
    private static final String INSUFFICIENT_STOCK_CODE = "project.exceptions.InsufficientStockException";
    private static final String INVALID_TRANSACTION_CODE = "project.exceptions.InvalidProductItemTransactionException";

    private static final int size = 5;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private LlmService llmService;

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

    @ExceptionHandler(LlmServiceException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    @ResponseBody
    public ErrorsDto handleLlmServiceException(LlmServiceException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(LLM_SERVICE_EXCEPTION_CODE, null,
                LLM_SERVICE_EXCEPTION_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(DietaryConflictException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleDietaryConflictException(DietaryConflictException exception, Locale locale) {
        String code = exception.getConflictType() == DietaryConflictException.ConflictType.VEGAN
                ? DIETARY_CONFLICT_VEGAN_CODE
                : DIETARY_CONFLICT_VEGETARIAN_CODE;
        String errorMessage = messageSource.getMessage(code, new Object[]{ exception.getProductName() }, code, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(IngredientUnitMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleIngredientUnitMismatchException(IngredientUnitMismatchException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INGREDIENT_UNIT_MISMATCH_CODE,
                new Object[]{ exception.getIngredientName(), exception.getIngredientUnit(), exception.getProductUnit() },
                INGREDIENT_UNIT_MISMATCH_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(InsufficientStockException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ErrorsDto handleInsufficientStockException(InsufficientStockException exception, Locale locale) {
        String names = String.join(", ", exception.getInsufficientIngredientNames());
        String errorMessage = messageSource.getMessage(INSUFFICIENT_STOCK_CODE,
                new Object[]{ names }, INSUFFICIENT_STOCK_CODE, locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(InvalidProductItemTransactionException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ErrorsDto handleInvalidProductItemTransactionException(InvalidProductItemTransactionException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(exception.getErrorCode(), null, exception.getErrorCode(), locale);
        return new ErrorsDto(errorMessage);
    }

    @Operation(summary = "Generar una sugerencia de receta con IA")
    @PostMapping("/generate-ai")
    public NewRecipeParamsDto generateAiRecipe(
            @RequestAttribute Long userId,
            @RequestParam Long householdId,
            @RequestBody GenerateAiRecipeParamsDto params,
            Locale locale) throws InstanceNotFoundException, LlmServiceException {

        return llmService.generateRecipe(userId, householdId, params, locale);
    }

    @Operation(summary = "Crear una receta")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeDto createRecipe(@RequestAttribute Long userId,
            @Validated @RequestBody NewRecipeParamsDto params)
            throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException {

        Recipe recipe = recipeService.createRecipe(userId, params);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipe.getId());

        return RecipeConversor.toRecipeDto(recipe, ingredients);
    }

    @Operation(summary = "Actualizar una receta")
    @PutMapping("/{recipeId}")
    public RecipeDto updateRecipe(@RequestAttribute Long userId,
            @PathVariable Long recipeId,
            @Validated @RequestBody NewRecipeParamsDto params)
            throws InstanceNotFoundException, DietaryConflictException, IngredientUnitMismatchException {

        Recipe recipe = recipeService.updateRecipe(userId, recipeId, params);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipe.getId());

        return RecipeConversor.toRecipeDto(recipe, ingredients);
    }

    @DeleteMapping("/{recipeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRecipe(@RequestAttribute Long userId,
            @PathVariable Long recipeId) throws InstanceNotFoundException {

        recipeService.deleteRecipe(userId, recipeId);
    }

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

    @Operation(summary = "Vista previa de cocinar una receta")
    @GetMapping("/{recipeId}/cook-preview")
    public CookRecipePreviewDto cookPreview(@RequestAttribute Long userId,
            @PathVariable Long recipeId) throws InstanceNotFoundException {

        CookRecipePreview preview = recipeService.previewCookRecipe(userId, recipeId);
        return CookedRecipeConversor.toCookRecipePreviewDto(preview);
    }

    @Operation(summary = "Cocinar una receta")
    @PostMapping("/{recipeId}/cook")
    public CookedRecipeDto cook(@RequestAttribute Long userId,
            @PathVariable Long recipeId,
            @RequestBody CookRecipeParamsDto params)
            throws InstanceNotFoundException, InsufficientStockException, InvalidProductItemTransactionException {

        CookedRecipe cookedRecipe = recipeService.cookRecipe(userId, recipeId, params.isForcePartial());
        return CookedRecipeConversor.toCookedRecipeDto(cookedRecipe);
    }

    @Operation(summary = "Subir o cambiar la foto de una receta")
    @PostMapping(value = "/{recipeId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RecipeDto uploadRecipeImage(@RequestAttribute Long userId,
            @PathVariable Long recipeId,
            @RequestParam("file") MultipartFile file)
            throws InstanceNotFoundException, IOException {

        Recipe recipe = recipeService.uploadRecipeImage(userId, recipeId, file);
        List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(recipeId);
        return RecipeConversor.toRecipeDto(recipe, ingredients);
    }

}
