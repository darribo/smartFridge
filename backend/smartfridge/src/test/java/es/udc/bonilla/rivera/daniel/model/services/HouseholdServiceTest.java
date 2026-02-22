package es.udc.bonilla.rivera.daniel.model.services;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import es.udc.bonilla.rivera.daniel.model.common.DuplicateInstanceException;
import es.udc.bonilla.rivera.daniel.model.common.InstanceNotFoundException;
import es.udc.bonilla.rivera.daniel.model.common.PermissionException;
import es.udc.bonilla.rivera.daniel.model.daos.HouseholdDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserDao;
import es.udc.bonilla.rivera.daniel.model.daos.UserHouseholdDao;
import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;
import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;
import es.udc.bonilla.rivera.daniel.model.entities.UserHouseholdId;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HouseholdServiceTest {

    private static final Long NON_EXISTING_ID = 999L;

    @Autowired
    private HouseholdService householdService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private HouseholdDao householdDao;

    @Autowired
    private UserHouseholdDao userHouseholdDao;

    /* @Autowired
    private HouseholdInvitationDao householdInvitationDao; */

    private User createUser(String suffix) {
        User user = new User(
            "user_" + suffix,
            "pass",
            "user_" + suffix + "@mail.com",
            "Name",
            "Last",
            "avatar.png",
            User.Role.USER
        );

        return userDao.save(user);
    }

    private Household createHousehold(String name, User admin) {
        Household household = new Household(name, "desc", "ES", "GA", "Galicia", admin);
        return householdDao.save(household);
    }

    @Test
    void createHouseholdValid() throws Exception {

        User admin = createUser("admin_create");

        Household created = householdService.createHousehold(
            admin.getId(), "Fridge Home", "desc", "ES", "GA", "Galicia");

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("Fridge Home", created.getName());
        assertEquals(admin.getId(), created.getAdmin().getId());
        assertTrue(userHouseholdDao.findById(new UserHouseholdId(admin.getId(), created.getId())).isPresent());
    }

    @Test
    void createHouseholdDuplicateName() throws Exception {

        User admin = createUser("admin_duplicate");
        householdService.createHousehold(admin.getId(), "Fridge Home", "desc", "ES", "GA", "Galicia");

        assertThrows(DuplicateInstanceException.class, () ->
            householdService.createHousehold(admin.getId(), "Fridge Home", "desc", "ES", "GA", "Galicia"));
    }

    @Test
    void updateUserHouseholdValid() throws Exception {

        User admin = createUser("admin_update");
        Household household = createHousehold("Old name", admin);

        Household updated = householdService.updateHousehold(
            household.getId(), admin.getId(), "New name", "New desc", "PT", "01", "Norte");

        assertEquals(household.getId(), updated.getId());
        assertEquals("New name", updated.getName());
        assertEquals("New desc", updated.getDescription());
        assertEquals("PT", updated.getCountryCode());
        assertEquals("01", updated.getRegionCode());
        assertEquals("Norte", updated.getRegionName());
    }

    @Test
    void updateUserHouseholdNonAdminCannotUpdate() {

        User admin = createUser("admin_permission");
        User member = createUser("member_permission");
        Household household = createHousehold("Home", admin);

        assertThrows(PermissionException.class, () ->
            householdService.updateHousehold(household.getId(), member.getId(), "X", "Y", "ES", "GA", "Galicia"));
    }

    @Test
    void changeAdminValid() throws Exception {

        User currentAdmin = createUser("admin_change_current");
        User newAdmin = createUser("admin_change_new");
        Household household = createHousehold("Home", currentAdmin);
        householdService.addUserHousehold(newAdmin.getId(), household.getId());

        Household updated = householdService.changeAdmin(currentAdmin.getId(), newAdmin.getId(), household.getId());

        assertEquals(newAdmin.getId(), updated.getAdmin().getId());
    }

    @Test
    void changeAdminFailsWhenNewAdminIsNotMember() {

        User currentAdmin = createUser("admin_change_current_not_member");
        User newAdmin = createUser("admin_change_new_not_member");
        Household household = createHousehold("Home", currentAdmin);

        assertThrows(InstanceNotFoundException.class, () ->
            householdService.changeAdmin(currentAdmin.getId(), newAdmin.getId(), household.getId()));
    }

    @Test
    void removeHouseholdValid() throws Exception {

        User admin = createUser("admin_remove");
        Household household = createHousehold("Home", admin);

        householdService.removeHousehold(admin.getId(), household.getId());

        assertTrue(householdDao.findById(household.getId()).isEmpty());
    }

    /* @Test
    void sendHouseholdInvitationValid() throws Exception {

        User host = createUser("host_invite_valid");
        User guest = createUser("guest_invite_valid");
        Household household = createHousehold("Home", host);

        HouseholdInvitation invitation = householdService.sendHouseholdInvitation(
            host.getId(), guest.getId(), household.getId());

        assertNotNull(invitation.getId());
        assertEquals(HouseholdInvitation.Status.PENDING, invitation.getStatus());
        assertEquals(host.getId(), invitation.getHost().getId());
        assertEquals(guest.getId(), invitation.getGuest().getId());
    }

    @Test
    void sendHouseholdInvitationDuplicatePending() throws Exception {

        User host = createUser("host_invite_dup");
        User guest = createUser("guest_invite_dup");
        Household household = createHousehold("Home", host);
        householdService.sendHouseholdInvitation(host.getId(), guest.getId(), household.getId());

        assertThrows(DuplicateInstanceException.class, () ->
            householdService.sendHouseholdInvitation(host.getId(), guest.getId(), household.getId()));
    }

    @Test
    void acceptInvitationValid() throws Exception {

        User host = createUser("host_accept");
        User guest = createUser("guest_accept");
        Household household = createHousehold("Home", host);

        HouseholdInvitation invitation = householdService.sendHouseholdInvitation(
            host.getId(), guest.getId(), household.getId());

        UserHousehold relation = householdService.acceptInvitation(guest.getId(), invitation.getId());

        assertEquals(guest.getId(), relation.getId().getUserId());
        assertEquals(household.getId(), relation.getId().getHouseholdId());
        HouseholdInvitation updatedInvitation = householdInvitationDao.findById(invitation.getId()).orElseThrow();
        assertEquals(HouseholdInvitation.Status.ACCEPTED, updatedInvitation.getStatus());
    }

    @Test
    void acceptInvitationFailsForDifferentGuest() throws Exception {

        User host = createUser("host_accept_wrong");
        User invitationGuest = createUser("guest_accept_wrong_invited");
        User anotherGuest = createUser("guest_accept_wrong_request");
        Household household = createHousehold("Home", host);

        HouseholdInvitation invitation = householdService.sendHouseholdInvitation(
            host.getId(), invitationGuest.getId(), household.getId());

        assertThrows(InstanceNotFoundException.class, () ->
            householdService.acceptInvitation(anotherGuest.getId(), invitation.getId()));
    }

    @Test
    void rejectInvitationValid() throws Exception {

        User host = createUser("host_reject");
        User guest = createUser("guest_reject");
        Household household = createHousehold("Home", host);

        HouseholdInvitation invitation = householdService.sendHouseholdInvitation(
            host.getId(), guest.getId(), household.getId());

        HouseholdInvitation rejected = householdService.rejectInvitation(guest.getId(), invitation.getId());

        assertEquals(HouseholdInvitation.Status.REJECTED, rejected.getStatus());
        assertNotNull(rejected.getResponseDate());
    } */

    @Test
    void getUserHouseholdValid() throws Exception {

        User admin = createUser("admin_get_relation");
        User member = createUser("member_get_relation");
        Household household = createHousehold("Home", admin);
        householdService.addUserHousehold(member.getId(), household.getId());

        UserHousehold relation = householdService.getUserHousehold(member.getId(), household.getId());

        assertEquals(member.getId(), relation.getId().getUserId());
        assertEquals(household.getId(), relation.getId().getHouseholdId());
    }

    @Test
    void leaveHouseholdNonAdminDeletesOnlyRelation() throws Exception {

        User admin = createUser("admin_leave_member");
        User member = createUser("member_leave_member");
        Household household = createHousehold("Home", admin);
        householdService.addUserHousehold(member.getId(), household.getId());

        householdService.leaveHousehold(member.getId(), household.getId());

        assertTrue(userHouseholdDao.findById(new UserHouseholdId(member.getId(), household.getId())).isEmpty());
        assertTrue(householdDao.findById(household.getId()).isPresent());
    }

    @Test
    void leaveHouseholdAdminWithoutOtherMembersDeletesHousehold() throws Exception {

        User admin = createUser("admin_leave_alone");
        Household household = createHousehold("Home", admin);
        householdService.addUserHousehold(admin.getId(), household.getId());

        householdService.leaveHousehold(admin.getId(), household.getId());

        assertTrue(householdDao.findById(household.getId()).isEmpty());
    }

    @Test
    void leaveHouseholdAdminTransfersAdminToOldestMember() throws Exception {

        User admin = createUser("admin_leave_transfer");
        User olderMember = createUser("member_leave_transfer_old");
        User newerMember = createUser("member_leave_transfer_new");
        Household household = createHousehold("Home", admin);

        userHouseholdDao.save(new UserHousehold(admin, household, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));
        userHouseholdDao.save(new UserHousehold(olderMember, household, LocalDateTime.of(2026, 2, 17, 10, 1, 0)));
        userHouseholdDao.save(new UserHousehold(newerMember, household, LocalDateTime.of(2026, 2, 17, 10, 2, 0)));

        householdService.leaveHousehold(admin.getId(), household.getId());

        Household persisted = householdDao.findById(household.getId()).orElseThrow();
        assertEquals(olderMember.getId(), persisted.getAdmin().getId());
        assertTrue(userHouseholdDao.findById(new UserHouseholdId(admin.getId(), household.getId())).isEmpty());
    }

    @Test
    void leaveHouseholdFailsIfRelationDoesNotExist() {

        User admin = createUser("admin_leave_missing");
        Household household = createHousehold("Home", admin);

        assertThrows(InstanceNotFoundException.class, () ->
            householdService.leaveHousehold(admin.getId(), household.getId()));
    }

    @Test
    void createHouseholdWithANonExistingUser() {
        assertThrows(InstanceNotFoundException.class, () ->
            householdService.createHousehold(NON_EXISTING_ID, "Home", "desc", "ES", "GA", "Galicia"));
    }

    @Test
    void getUserHouseholdsReturnsPagedResults() {

        User user = createUser("user_households_page");

        Household h1 = createHousehold("Home-1", user);
        Household h2 = createHousehold("Home-2", user);

        userHouseholdDao.save(new UserHousehold(user, h1, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));
        userHouseholdDao.save(new UserHousehold(user, h2, LocalDateTime.of(2026, 2, 17, 11, 0, 0)));

        Block<Household> firstPage = householdService.getUserHouseholds(user.getId(), 0, 1);

        assertEquals(1, firstPage.getItems().size());
        assertTrue(firstPage.getExistMoreItems());
        assertEquals("Home-2", firstPage.getItems().get(0).getName());
    }

    @Test
    void getHouseholdMembersReturnsPagedResults() throws Exception {

        User admin = createUser("admin_household_members_page");
        User m1 = createUser("member_household_members_page_1");
        User m2 = createUser("member_household_members_page_2");
        Household household = createHousehold("Home-members", admin);

        userHouseholdDao.save(new UserHousehold(admin, household, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));
        userHouseholdDao.save(new UserHousehold(m1, household, LocalDateTime.of(2026, 2, 17, 10, 1, 0)));
        userHouseholdDao.save(new UserHousehold(m2, household, LocalDateTime.of(2026, 2, 17, 10, 2, 0)));

        Block<User> firstPage = householdService.getHouseholdMembers(admin.getId(), household.getId(), 0, 2);

        assertEquals(2, firstPage.getItems().size());
        assertTrue(firstPage.getExistMoreItems());
        List<Long> memberIds = firstPage.getItems().stream().map(User::getId).toList();
        assertTrue(memberIds.contains(admin.getId()));
        assertTrue(memberIds.contains(m1.getId()) || memberIds.contains(m2.getId()));
    }

    @Test
    void getHouseholdMembersFailsWhenRequesterIsNotMember() {

        User admin = createUser("admin_household_members_perm");
        User outsider = createUser("outsider_household_members_perm");
        Household household = createHousehold("Home-members-perm", admin);

        userHouseholdDao.save(new UserHousehold(admin, household, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));

        assertThrows(InstanceNotFoundException.class, () ->
            householdService.getHouseholdMembers(outsider.getId(), household.getId(), 0, 2));
    }

    @Test
    void getHouseholdMembersNumberReturnsCount() throws Exception {

        User admin = createUser("admin_household_count");
        User m1 = createUser("member_household_count_1");
        User m2 = createUser("member_household_count_2");
        Household household = createHousehold("Home-count", admin);

        userHouseholdDao.save(new UserHousehold(admin, household, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));
        userHouseholdDao.save(new UserHousehold(m1, household, LocalDateTime.of(2026, 2, 17, 10, 1, 0)));
        userHouseholdDao.save(new UserHousehold(m2, household, LocalDateTime.of(2026, 2, 17, 10, 2, 0)));

        int members = householdService.getHouseholdMembersNumber(admin.getId(), household.getId());

        assertEquals(3, members);
    }

    @Test
    void getHouseholdMembersNumberFailsWhenRequesterIsNotMember() {

        User admin = createUser("admin_household_count_perm");
        User outsider = createUser("outsider_household_count_perm");
        Household household = createHousehold("Home-count-perm", admin);

        userHouseholdDao.save(new UserHousehold(admin, household, LocalDateTime.of(2026, 2, 17, 10, 0, 0)));

        assertThrows(InstanceNotFoundException.class, () ->
            householdService.getHouseholdMembersNumber(outsider.getId(), household.getId()));
    }
}
