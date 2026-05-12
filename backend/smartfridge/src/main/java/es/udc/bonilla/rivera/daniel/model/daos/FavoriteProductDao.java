package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.FavoriteProduct;

public interface FavoriteProductDao extends JpaRepository<FavoriteProduct, Long> {

    Optional<FavoriteProduct> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT fp.product.id FROM FavoriteProduct fp WHERE fp.user.id = :userId AND fp.product.household.id = :householdId")
    Set<Long> findFavoriteProductIdsByUserIdAndHouseholdId(@Param("userId") Long userId, @Param("householdId") Long householdId);

    @Query("""
        SELECT fp.product.id, fp.user.id
        FROM FavoriteProduct fp
        JOIN UserHousehold uh ON uh.user.id = fp.user.id AND uh.household.id = :householdId
        WHERE fp.product.id IN :productIds
        """)
    List<Object[]> findFavoritesByHouseholdMembersForProducts(
        @Param("householdId") Long householdId,
        @Param("productIds") List<Long> productIds);

    @Query("""
        SELECT fp.product.id, fp.user.id
        FROM FavoriteProduct fp
        JOIN UserHousehold uh ON uh.user.id = fp.user.id AND uh.household.id = :householdId
        WHERE fp.product.id = :productId
        """)
    List<Object[]> findFavoritesByHouseholdMembersForProduct(
        @Param("householdId") Long householdId,
        @Param("productId") Long productId);

}
