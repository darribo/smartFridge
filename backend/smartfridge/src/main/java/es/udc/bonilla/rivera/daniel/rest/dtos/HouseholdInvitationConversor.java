/* package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.HouseholdInvitation;

public class HouseholdInvitationConversor {

    private HouseholdInvitationConversor(){}

    public static final HouseholdInvitationDto toHouseholdInvitationDto(HouseholdInvitation householdInvitation) {

        return new HouseholdInvitationDto(householdInvitation.getId(), householdInvitation.getHousehold().getId(),
        householdInvitation.getHost().getId(), householdInvitation.getGuest().getId(), householdInvitation.getGuest().getEmail(),householdInvitation.getSendingDate(), householdInvitation.getResponseDate(),
        householdInvitation.getStatus().toString());
    }


    public static final List<HouseholdInvitationDto> toHouseholdInvitationDtos(List<HouseholdInvitation> householdInvitations) {
        
        List<HouseholdInvitationDto> list = new ArrayList<>();

        for(HouseholdInvitation invitation : householdInvitations) {
            list.add(toHouseholdInvitationDto(invitation));
        }

        return list;
    }

}
 */