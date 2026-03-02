/* package es.udc.bonilla.rivera.daniel.model.daos;

import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

import es.udc.bonilla.rivera.daniel.model.entities.HouseholdInvitation;
import es.udc.bonilla.rivera.daniel.model.entities.HouseholdInvitation.Status;

public interface HouseholdInvitationDao extends JpaRepository<HouseholdInvitation, Long>{

    boolean existsByHostIdAndGuestIdAndStatus(Long hostId, Long guestId, Status accepted);

    Optional<HouseholdInvitation> findByIdAndStatus(Long householdInvitationId, Status pending);

    Slice<HouseholdInvitation> findByHouseholdIdAndStatusOrderBySendingDateDesc(Long householdId, Status pending,
            PageRequest of);

}
 */