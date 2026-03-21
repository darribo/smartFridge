package es.udc.bonilla.rivera.daniel.model.daos;

import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItemTransaction;

public interface ProductItemTransactionDao extends JpaRepository<ProductItemTransaction, Long> {

    boolean existsByProductItemId(Long productItemId);

}
