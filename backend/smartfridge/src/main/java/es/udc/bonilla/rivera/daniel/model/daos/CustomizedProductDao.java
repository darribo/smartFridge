package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.domain.Slice;

import es.udc.bonilla.rivera.daniel.model.entities.Product;
import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public interface CustomizedProductDao {

    Slice<Product> findProducts(
            Long householdId,
            String name,
            String brand,
            Boolean isVegetarian,
            Boolean isVegan,
            Product.NutriScoreGrade nutriScoreGrade,
            Product.NovaGroup novaGroup,
            ProductItem.StorageLocation storageLocation,
            int page,
            int size);

}
