import { ApiError, appFetch, fetchConfig, setReauthenticationCallback, setServiceToken } from "../appFetch"

export type NewUserParams = {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  // avatar?: string; TODO: ¿Meter?
  allergyIds?: number[];
};

export type LoginParams = {
  userName: string;
  password: string;
};


export type User = {
    id: number,
    userName: string,
    firstName: string,
    lastName: string,
    email: string
    avatar: string,
}

export type AuthenticatedUser = {
    serviceToken: string,
    user: User
}

const processLoginSignUp = async (authenticatedUser: AuthenticatedUser, reauthenticationCallback?: () => void, onSuccess?: (auth: AuthenticatedUser) => void) => {
  await setServiceToken(authenticatedUser.serviceToken);
  
  if (reauthenticationCallback) {
    setReauthenticationCallback(reauthenticationCallback);
  }
  
  if (onSuccess) onSuccess(authenticatedUser);

}


export const signUp = async (user: NewUserParams, onSuccess?: (auth: AuthenticatedUser) => void, onError?: (err: ApiError) => void, reauthenticationCallback?: () => void) => {
    
    const body = { ...user, avatar: "placeholder"}; //TODO: Meter avatar
    
    const options = await fetchConfig("POST", body);
    
    return appFetch(
        "/users/signUp",
        options,
        (auth) => {
            processLoginSignUp(auth, reauthenticationCallback, onSuccess);
        },
        onError
    );
};

export const login = async (params: LoginParams, onSuccess?: (auth: AuthenticatedUser) => void, onError?: (err: ApiError) => void, reauthenticationCallback?: () => void) => {

    const options = await fetchConfig("POST", params);

    return appFetch(
        "/users/login",
        options,
        (auth) => {
            processLoginSignUp(auth, reauthenticationCallback, onSuccess);
        },
        onError
    );
};
