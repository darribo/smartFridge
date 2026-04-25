package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.List;

public class CookRecipePreviewDto {

    private boolean canCookFully;
    private List<CookIngredientPreviewLineDto> lines;

    public CookRecipePreviewDto() {}

    public CookRecipePreviewDto(boolean canCookFully, List<CookIngredientPreviewLineDto> lines) {
        this.canCookFully = canCookFully;
        this.lines = lines;
    }

    public boolean isCanCookFully() { return canCookFully; }
    public void setCanCookFully(boolean canCookFully) { this.canCookFully = canCookFully; }

    public List<CookIngredientPreviewLineDto> getLines() { return lines; }
    public void setLines(List<CookIngredientPreviewLineDto> lines) { this.lines = lines; }

}
