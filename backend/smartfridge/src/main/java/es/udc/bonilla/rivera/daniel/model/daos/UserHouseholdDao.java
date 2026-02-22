package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.entities.UserHouseholdId;

public interface UserHouseholdDao extends JpaRepository<UserHousehold, UserHouseholdId>{

    boolean existsByUserIdAndHouseholdId(Long userId, Long householdId);

    @Query(value = """
    SELECT u.*
    FROM users u
    JOIN UserHousehold uh on u.id = uh.userId
    JOIN Household h ON h.id = uh.householdId
    WHERE uh.householdId = :householdId
    AND (h.admin_id IS NULL OR uh.userId <> h.admin_id) /* TODO: Que adminId no sea nulo y cuando se vaya a borrar un usuario se haga la comprobación de si es admin de un household para quitárselo */
    ORDER BY uh.joinedAt ASC, u.id ASC
    LIMIT 1
    """, nativeQuery = true)
    Optional<User> findOldestNonAdminMember(@Param("householdId") Long householdId);


    @Query("""
    select h
    from Household h
    join UserHousehold uh on uh.household.id = h.id
    where uh.user.id = :userId
    order by uh.joinedAt desc
    """)
    Slice<Household> findUserHouseholds(@Param("userId") Long userId, Pageable pageable);


    @Query("""
    select uh.user
    from UserHousehold uh
    where uh.household.id = :householdId
    order by uh.user.role, uh.joinedAt
    """)
    Slice<User> findHouseholdMembers(@Param("householdId") Long householdId, Pageable pageable);

    int countByHousehold_Id(Long householdId);

}
