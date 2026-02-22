package es.udc.bonilla.rivera.daniel.rest.dtos;

import java.util.ArrayList;
import java.util.List;

import es.udc.bonilla.rivera.daniel.model.entities.Household;
import es.udc.bonilla.rivera.daniel.model.entities.User;

public class HouseholdConversor {

    private HouseholdConversor() {}

    public static final HouseholdDto toHouseholdDto(Household household){

        return new HouseholdDto(household.getId(), household.getName(), household.getDescription(),
        household.getCountryCode(), household.getRegionCode(), household.getRegionName(), household.getAdmin().getId());
    
    }

    public static final UserHouseholdListDto toUserHouseholdListDto(Household household, int householdMembers, List<String> avatars, boolean hasMore){

        return new UserHouseholdListDto(household.getId(), household.getName(), householdMembers, avatars, hasMore);

    }

    public static final HouseholdUserDto toHouseholdUserDto(User user){

        return new HouseholdUserDto(user.getId(), user.getFirstName() + " " + user.getLastName(), user.getEmail(), user.getAvatar(), user.getRole().toString());
    }

    public static final List<HouseholdUserDto> toHouseholdUserDtos(List<User> users){

        List<HouseholdUserDto> dtos = new ArrayList<>();

        for(User user : users){
            dtos.add(toHouseholdUserDto(user));
        }

        return dtos;
    }

}
