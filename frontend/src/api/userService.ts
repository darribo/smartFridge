import { ApiError, appFetch, fetchConfig, setReauthenticationCallback, setServiceToken } from "./appFetch"

export type NewUserParams = {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  // avatar?: string;        //TODO: ¿Meter?
  // allergyIds?: number[];  //TODO: Meter
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
    
    const body = { ...user, avatar: "placeholder", allergyIds: []}; //TODO: Meter avatar y alergias con todo lo demás
    
    const options = await fetchConfig("POST", body);
    
    appFetch(
        "/users/signUp",
        options,
        (auth) => {
            processLoginSignUp(auth, reauthenticationCallback, onSuccess);
        },
        onError
    );
};