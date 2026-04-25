package es.udc.bonilla.rivera.daniel.model.services;

import java.util.List;

public class CookRecipePreview {

    private boolean canCookFully;
    private List<CookIngredientPreviewLine> lines;

    public CookRecipePreview(boolean canCookFully, List<CookIngredientPreviewLine> lines) {
        this.canCookFully = canCookFully;
        this.lines = lines;
    }

    public boolean isCanCookFully() {
        return canCookFully;
    }

    public void setCanCookFully(boolean canCookFully) {
        this.canCookFully = canCookFully;
    }

    public List<CookIngredientPreviewLine> getLines() {
        return lines;
    }

    public void setLines(List<CookIngredientPreviewLine> lines) {
        this.lines = lines;
    }

}
