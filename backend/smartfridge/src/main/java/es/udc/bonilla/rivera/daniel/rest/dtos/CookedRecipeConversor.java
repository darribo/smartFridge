package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.CookedRecipe;
import es.udc.bonilla.rivera.daniel.model.services.CookIngredientPreviewLine;
import es.udc.bonilla.rivera.daniel.model.services.CookRecipePreview;

public class CookedRecipeConversor {

    private CookedRecipeConversor() {}

    public static CookedRecipeDto toCookedRecipeDto(CookedRecipe cookedRecipe) {
        return new CookedRecipeDto(
                cookedRecipe.getId(),
                cookedRecipe.getRecipe() != null ? cookedRecipe.getRecipe().getId() : null,
                cookedRecipe.getCookedAt().toString());
    }

    public static CookRecipePreviewDto toCookRecipePreviewDto(CookRecipePreview preview) {
        List<CookIngredientPreviewLineDto> lineDtos = preview.getLines().stream()
                .map(CookedRecipeConversor::toLineDto)
                .toList();
        return new CookRecipePreviewDto(preview.isCanCookFully(), lineDtos);
    }

    private static CookIngredientPreviewLineDto toLineDto(CookIngredientPreviewLine line) {
        return new CookIngredientPreviewLineDto(
                line.getIngredientId(),
                line.getIngredientName(),
                line.getRequiredQuantity() != null ? line.getRequiredQuantity().toString() : null,
                line.getAvailableQuantity() != null ? line.getAvailableQuantity().toString() : null,
                line.isSufficient(),
                line.isOptional(),
                line.getProductId(),
                line.getUnit());
    }

}
