package es.udc.bonilla.rivera.daniel.rest.dtos;

import es.udc.bonilla.rivera.daniel.model.entities.UserHousehold;

public class UserHouseholdConversor {

    private UserHouseholdConversor() {}

    public static final UserHouseholdDto toUserHouseholdDto (UserHousehold userHousehold) {
        return new UserHouseholdDto(userHousehold.getUser().getId(), userHousehold.getHousehold().getId(), userHousehold.getJoinedAt());
    }

}
