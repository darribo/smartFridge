package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.RecipeIngredient;

public interface RecipeIngredientDao extends JpaRepository<RecipeIngredient, Long> {

    List<RecipeIngredient> findByRecipeIdOrderByDisplayOrderAsc(Long recipeId);

    void deleteByRecipeId(Long recipeId);

}
