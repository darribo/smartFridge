package es.udc.bonilla.rivera.daniel.model.daos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.ProductItem;

public interface ProductItemDao extends JpaRepository<ProductItem, Long>{

    List<ProductItem> findByProductId(Long productId);

    @Query("SELECT pi FROM ProductItem pi WHERE pi.product.id = :productId " +
           "AND pi.discardDate IS NULL AND pi.quantityRemainingValue > 0 " +
           "ORDER BY CASE WHEN pi.openedAt IS NOT NULL THEN 0 ELSE 1 END ASC, " +
           "pi.expirationDate ASC NULLS LAST")
    List<ProductItem> findActiveItemsForCooking(@Param("productId") Long productId);

    @Query("SELECT pi FROM ProductItem pi WHERE pi.product.id = :productId " +
           "AND pi.discardDate IS NULL " +
           "AND (pi.initialQuantityValue IS NULL OR pi.quantityRemainingValue > 0) " +
           "ORDER BY pi.expirationDate ASC NULLS LAST")
    List<ProductItem> findActiveByProductId(@Param("productId") Long productId);

    int countByProductId(Long productId);

    // Que vaya a expirar supone que:
    // - va a expirar en los próximos 3 días
    // - o que se ha abierto y faltan 3 días para que expire después de abrirlo
    //   (en caso de productos con fecha de caducidad después de abrirlo)
    @Query(value =
        "SELECT pi.* FROM ProductItem pi " +
        "JOIN Product p ON pi.productId = p.id " +
        "WHERE p.householdId = :householdId " +
        "AND pi.discardDate IS NULL " +
        "AND (" +
            "pi.expirationDate <= :thresholdDate " +
            "OR (pi.openedAt IS NOT NULL AND p.daysAfterOpening IS NOT NULL " +
                "AND DATE_ADD(pi.openedAt, INTERVAL p.daysAfterOpening DAY) <= :thresholdDate)" +
        ")",
        nativeQuery = true
    )
    Slice<ProductItem> findExpiringProducts(
        @Param("householdId") Long householdId,
        @Param("thresholdDate") LocalDateTime thresholdDate,
        Pageable pageable);

    @Query(value =
        "SELECT pi.* FROM ProductItem pi " +
        "JOIN Product p ON pi.productId = p.id " +
        "WHERE p.householdId = :householdId " +
        "AND pi.discardDate IS NULL " +
        "AND pi.quantityRemainingValue IS NOT NULL " +
        "AND pi.initialQuantityValue IS NOT NULL " +
        "AND pi.initialQuantityValue > 0 " +
        "AND pi.quantityRemainingValue / pi.initialQuantityValue < 0.25 " +
        "AND pi.id = (" +
            "SELECT pi2.id FROM ProductItem pi2 " +
            "WHERE pi2.productId = pi.productId " +
            "AND pi2.discardDate IS NULL " +
            "AND pi2.quantityRemainingValue IS NOT NULL " +
            "ORDER BY pi2.quantityRemainingValue DESC LIMIT 1" +
        ")",
        nativeQuery = true
    )
    Slice<ProductItem> findProductsWithLittleStock(
        @Param("householdId") Long householdId,
        Pageable pageable);

    @Query(value =
        "SELECT COUNT(*) FROM ProductItem pi " +
        "JOIN Product p ON pi.productId = p.id " +
        "WHERE p.householdId = :householdId " +
        "AND pi.discardDate IS NULL " +
        "AND (" +
            "pi.expirationDate <= :thresholdDate " +
            "OR (pi.openedAt IS NOT NULL AND p.daysAfterOpening IS NOT NULL " +
                "AND DATE_ADD(pi.openedAt, INTERVAL p.daysAfterOpening DAY) <= :thresholdDate)" +
        ")",
        nativeQuery = true
    )
    long countExpiringProducts(
        @Param("householdId") Long householdId,
        @Param("thresholdDate") LocalDateTime thresholdDate);

    @Query(value =
        "SELECT COUNT(*) FROM ProductItem pi " +
        "JOIN Product p ON pi.productId = p.id " +
        "WHERE p.householdId = :householdId " +
        "AND pi.discardDate IS NULL " +
        "AND pi.quantityRemainingValue IS NOT NULL " +
        "AND pi.initialQuantityValue IS NOT NULL " +
        "AND pi.initialQuantityValue > 0 " +
        "AND pi.quantityRemainingValue / pi.initialQuantityValue < 0.25 " +
        "AND pi.id = (" +
            "SELECT pi2.id FROM ProductItem pi2 " +
            "WHERE pi2.productId = pi.productId " +
            "AND pi2.discardDate IS NULL " +
            "AND pi2.quantityRemainingValue IS NOT NULL " +
            "ORDER BY pi2.quantityRemainingValue DESC LIMIT 1" +
        ")",
        nativeQuery = true
    )
    long countProductsWithLittleStock(@Param("householdId") Long householdId);

    @Query(value =
        "SELECT COUNT(*) FROM ProductItem pi " +
        "JOIN Product p ON pi.productId = p.id " +
        "WHERE p.householdId = :householdId " +
        "AND pi.discardDate IS NULL " +
        "AND (pi.initialQuantityValue IS NULL OR pi.quantityRemainingValue > 0)",
        nativeQuery = true
    )
    long countProductItemsByHousehold(@Param("householdId") Long householdId);

    @Query("SELECT COUNT(pi) FROM ProductItem pi WHERE pi.product.id = :productId " +
           "AND pi.discardDate IS NULL " +
           "AND (pi.initialQuantityValue IS NULL OR pi.quantityRemainingValue > 0)")
    int countActiveByProductId(@Param("productId") Long productId);

    @Query("SELECT i.product.id, SUM(i.quantityRemainingValue) " +
           "FROM ProductItem i " +
           "WHERE i.product.household.id = :householdId " +
           "AND i.discardDate IS NULL " +
           "AND i.quantityRemainingValue IS NOT NULL " +
           "GROUP BY i.product.id")
    List<Object[]> sumRemainingQuantityByProduct(@Param("householdId") Long householdId);

}
