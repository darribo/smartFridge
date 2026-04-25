package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

public class CustomizedProductDaoImpl implements CustomizedProductDao {

    @PersistenceContext
    private EntityManager entityManager;

    private String[] getTokens(String keywords) {

        if (keywords == null || keywords.isBlank()) {
            return new String[0];
        }

        return keywords.trim().split("\\s+");
    }

    @Override
    public Slice<Product> findProducts(Long householdId, String name, String brand, Boolean isVegetarian,
            Boolean isVegan, Product.NutriScoreGrade nutriScoreGrade, Product.NovaGroup novaGroup,
            ProductItem.StorageLocation storageLocation, int page, int size) {

        String[] nameTokens = getTokens(name);
        String[] brandTokens = getTokens(brand);

        StringBuilder queryString = new StringBuilder();
        queryString.append("SELECT p ")
                .append("FROM Product p ")
                .append("WHERE p.household.id = :householdId ");

        for (int i = 0; i < nameTokens.length; i++) {
            queryString.append("AND LOWER(p.name) LIKE :nameTok").append(i).append(" ");
        }

        for (int i = 0; i < brandTokens.length; i++) {
            queryString.append("AND LOWER(p.brand) LIKE :brandTok").append(i).append(" ");
        }

        if (isVegetarian != null) {
            queryString.append("AND p.vegetarian = :isVegetarian ");
        }

        if (isVegan != null) {
            queryString.append("AND p.vegan = :isVegan ");
        }

        if (nutriScoreGrade != null) {
            queryString.append("AND p.nutriScoreGrade = :nutriScoreGrade ");
        }

        if (novaGroup != null) {
            queryString.append("AND p.novaGroup = :novaGroup ");
        }

        if (storageLocation != null) {
            queryString.append("AND EXISTS (")
                    .append("SELECT pi.id ")
                    .append("FROM ProductItem pi ")
                    .append("WHERE pi.product.id = p.id ")
                    .append("AND pi.storageLocation = :storageLocation")
                    .append(") ");
        }

        queryString.append("ORDER BY ")
                .append("(SELECT COUNT(pi) FROM ProductItem pi WHERE pi.product = p ")
                .append("AND pi.discardDate IS NULL ")
                .append("AND (pi.initialQuantityValue IS NULL OR pi.quantityRemainingValue > 0)) DESC, ")
                .append("p.name ASC, p.id ASC");

        TypedQuery<Product> query = entityManager.createQuery(queryString.toString(), Product.class)
                .setParameter("householdId", householdId)
                .setFirstResult(page * size)
                .setMaxResults(size + 1);

        for (int i = 0; i < nameTokens.length; i++) {
            query.setParameter("nameTok" + i, "%" + nameTokens[i].toLowerCase() + "%");
        }

        for (int i = 0; i < brandTokens.length; i++) {
            query.setParameter("brandTok" + i, "%" + brandTokens[i].toLowerCase() + "%");
        }

        if (isVegetarian != null) {
            query.setParameter("isVegetarian", isVegetarian);
        }

        if (isVegan != null) {
            query.setParameter("isVegan", isVegan);
        }

        if (nutriScoreGrade != null) {
            query.setParameter("nutriScoreGrade", nutriScoreGrade);
        }

        if (novaGroup != null) {
            query.setParameter("novaGroup", novaGroup);
        }

        if (storageLocation != null) {
            query.setParameter("storageLocation", storageLocation);
        }

        List<Product> items = query.getResultList();
        boolean hasNext = items.size() == size + 1;

        if (hasNext) {
            items.remove(items.size() - 1);
        }

        return new SliceImpl<>(items, PageRequest.of(page, size), hasNext);
    }

}
