package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;

public interface RecipeDao extends JpaRepository<Recipe, Long>, CustomizedRecipeDao {}
