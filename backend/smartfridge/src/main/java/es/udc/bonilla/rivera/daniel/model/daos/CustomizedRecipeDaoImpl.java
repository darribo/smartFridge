package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import es.udc.bonilla.rivera.daniel.model.entities.Recipe;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

public class CustomizedRecipeDaoImpl implements CustomizedRecipeDao {

    @PersistenceContext
    private EntityManager entityManager;

    private String[] getTokens(String keywords) {
        if (keywords == null || keywords.isBlank()) {
            return new String[0];
        }
        return keywords.trim().split("\\s+");
    }

    @Override
    public Slice<Recipe> findRecipes(Long userId, Long householdId, String title,
            Integer minMinutes, Integer maxMinutes,
            Recipe.Difficulty difficulty, Recipe.MealType mealType,
            Recipe.CuisineType cuisineType, Recipe.DietType dietType,
            Recipe.SeasonType seasonType, Boolean isVegetarian, Boolean isVegan,
            List<Long> productIds, int page, int size) {

        String[] titleTokens = getTokens(title);

        StringBuilder queryString = new StringBuilder();
        queryString.append("SELECT r FROM Recipe r WHERE r.createdBy.id = :userId AND r.household.id = :householdId ");

        for (int i = 0; i < titleTokens.length; i++) {
            queryString.append("AND LOWER(r.title) LIKE :titleTok").append(i).append(" ");
        }

        if (minMinutes != null) {
            queryString.append("AND r.totalMinutes >= :minMinutes ");
        }

        if (maxMinutes != null) {
            queryString.append("AND r.totalMinutes <= :maxMinutes ");
        }

        if (difficulty != null) {
            queryString.append("AND r.difficulty = :difficulty ");
        }

        if (mealType != null) {
            queryString.append("AND r.mealType = :mealType ");
        }

        if (cuisineType != null) {
            queryString.append("AND r.cuisineType = :cuisineType ");
        }

        if (dietType != null) {
            queryString.append("AND r.dietType = :dietType ");
        }

        if (seasonType != null) {
            queryString.append("AND r.seasonType = :seasonType ");
        }

        if (isVegetarian != null) {
            queryString.append("AND r.vegetarian = :isVegetarian ");
        }

        if (isVegan != null) {
            queryString.append("AND r.vegan = :isVegan ");
        }

        if (productIds != null && !productIds.isEmpty()) {
            queryString.append("AND (SELECT COUNT(DISTINCT i.product.id) FROM RecipeIngredient i ")
                    .append("WHERE i.recipe.id = r.id AND i.product.id IN :productIds) = :productCount ");
        }

        queryString.append("ORDER BY r.createdAt DESC, r.id DESC");

        TypedQuery<Recipe> query = entityManager.createQuery(queryString.toString(), Recipe.class)
                .setParameter("userId", userId)
                .setParameter("householdId", householdId)
                .setFirstResult(page * size)
                .setMaxResults(size + 1);

        for (int i = 0; i < titleTokens.length; i++) {
            query.setParameter("titleTok" + i, "%" + titleTokens[i].toLowerCase() + "%");
        }

        if (minMinutes != null) {
            query.setParameter("minMinutes", minMinutes);
        }

        if (maxMinutes != null) {
            query.setParameter("maxMinutes", maxMinutes);
        }

        if (difficulty != null) {
            query.setParameter("difficulty", difficulty);
        }

        if (mealType != null) {
            query.setParameter("mealType", mealType);
        }

        if (cuisineType != null) {
            query.setParameter("cuisineType", cuisineType);
        }

        if (dietType != null) {
            query.setParameter("dietType", dietType);
        }

        if (seasonType != null) {
            query.setParameter("seasonType", seasonType);
        }

        if (isVegetarian != null) {
            query.setParameter("isVegetarian", isVegetarian);
        }

        if (isVegan != null) {
            query.setParameter("isVegan", isVegan);
        }

        if (productIds != null && !productIds.isEmpty()) {
            query.setParameter("productIds", productIds);
            query.setParameter("productCount", (long) productIds.size());
        }

        List<Recipe> items = query.getResultList();
        boolean hasNext = items.size() == size + 1;

        if (hasNext) {
            items.remove(items.size() - 1);
        }

        return new SliceImpl<>(items, PageRequest.of(page, size), hasNext);
    }

}
