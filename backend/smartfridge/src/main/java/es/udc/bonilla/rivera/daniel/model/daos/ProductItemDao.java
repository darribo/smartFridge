package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public interface ProductItemDao extends JpaRepository<ProductItem, Long>{

    List<ProductItem> findByProductId(Long productId);

    int countByProductId(Long productId);

}
