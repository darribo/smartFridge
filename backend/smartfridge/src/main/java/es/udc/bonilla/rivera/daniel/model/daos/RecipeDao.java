package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;

public interface RecipeDao extends JpaRepository<Recipe, Long>, CustomizedRecipeDao {

    @Query("SELECT r.title FROM Recipe r WHERE r.createdBy.id = :userId AND r.household.id = :householdId")
    List<String> findTitlesByUserAndHousehold(@Param("userId") Long userId, @Param("householdId") Long householdId);

}
