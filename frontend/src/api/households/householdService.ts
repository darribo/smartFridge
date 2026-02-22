import { ApiError, appFetch, fetchConfig } from "../appFetch";
import { Block } from "../block";

export type NewHouseholdParams = {
    name: string;
    description: string;
    /* countryCode: string;
    regionCode: string;
    regionName: string; */
}

export type Household = {
    id: number;
    name: string;
    description: string;
    countryCode: string;
    regionCode: string;
    regionName: string;
    adminId: number;
}

export type UserHouseholdListItem = {
    id: number;
    name: string;
    membersNumber: number;
    membersAvatar: string[];
    hasMore: boolean;
}

type ApiUserHouseholdListItem = {
    id: number;
    name: string;
    membersNumber: number;
    membersAvatars?: string[];
    membersAvatar?: string[];
    hasMore: boolean;
};

export type HouseholdUser = {
    userId: number;
    userFullName: string;
    userEmail: string;
    userAvatar: string | null;
    isAdmin: boolean;
}

type ApiHouseholdUser = {
    userId: number;
    fullName: string;
    userEmail: string;
    userAvatar: string | null;
    isAdmin: boolean;
};

/* export type HouseholdInvitation = {
    id: number,
    householdId: number,
    hostId: number,
    guestId: number,
    guestEmail: number,
    sentAt: string,
    status: string,
} */


export const createHousehold = async (params: NewHouseholdParams, onSuccess?: (household: Household) => void, onError?: (err: ApiError) => void) => {

    const body = {
        ...params,
        countryCode: "123",
        regionCode: "es-Es",
        regionName: "España"
    }

    const options = await fetchConfig("POST", body);

    return appFetch(
        "/households",
        options,
        onSuccess,
        onError
    );
}


export const getHousehold = async(
    householdId: number,
    onSuccess?: (household: Household) => void,
    onError?: (err: ApiError) => void
) => {

    const options = await fetchConfig("GET");
    return appFetch(
        `/households/${householdId}`,
        options,
        onSuccess,
        onError
    );
}


export const getUserHouseholds = async(
    page: number,
    onSuccess?: (block: Block<UserHouseholdListItem>) => void,
    onError?: (err: ApiError) => void
) => {

    const options = await fetchConfig("GET");
    return appFetch(
        `/households/userHouseholds?page=${page}`,
        options,
        (block: Block<ApiUserHouseholdListItem>) => {
            const mapped: Block<UserHouseholdListItem> = {
                ...block,
                items: block.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    membersNumber: item.membersNumber,
                    membersAvatar: item.membersAvatars ?? item.membersAvatar ?? [],
                    hasMore: item.hasMore,
                })),
            };

            onSuccess?.(mapped);
        },
        onError
    );
}


export const getHouseholdMembers = async(
    householdId: number,
    page: number,
    onSuccess?: (block: Block<HouseholdUser>) => void,
    onError?: (err: ApiError) => void
) => {

    const options = await fetchConfig("GET");
    
    return appFetch(
        `/households/${householdId}/users?page=${page}`,
        options,
        (block: Block<ApiHouseholdUser>) => {
            const mapped: Block<HouseholdUser> = {
                ...block,
                items: block.items.map((item) => ({
                    userId: item.userId,
                    userFullName: item.fullName,
                    userEmail: item.userEmail,
                    userAvatar: item.userAvatar,
                    isAdmin: item.isAdmin,
                })),
            };

            onSuccess?.(mapped);
        },
        onError
    );
}

/* export const getPendingInvitations = async(
    householdId: number,
    page: number,
    onSuccess?: (block: Block<HouseholdInvitation>) => void,
    onError?: (err: ApiError) => void
) => {

    const options = await fetchConfig("GET");
    
    return appFetch(
        `/households/${householdId}/pendingInvitations`,
        options,
        onSuccess,
        onError
    );
} */
