import { ApiError, appFetch, fetchConfig, removeServiceToken, setReauthenticationCallback, setServiceToken } from "../appFetch"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../../config/constants";
import { useUserStore } from "../../store/userStore";

export type NewUserParams = {
  userName: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
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
  await AsyncStorage.setItem(config.AUTH_USER_KEY, JSON.stringify(authenticatedUser.user));
  useUserStore.getState().setUser(authenticatedUser.user);

  if (reauthenticationCallback) {
    setReauthenticationCallback(reauthenticationCallback);
  }

  if (onSuccess) onSuccess(authenticatedUser);
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(config.AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const signUp = async (user: NewUserParams, onSuccess?: (auth: AuthenticatedUser) => void, onError?: (err: ApiError) => void, reauthenticationCallback?: () => void) => {
    const body = { ...user, avatar: "placeholder" };
    const options = await fetchConfig("POST", body);
    return appFetch(
        "/users/signUp",
        options,
        (auth) => { processLoginSignUp(auth, reauthenticationCallback, onSuccess); },
        onError
    );
};

export const login = async (params: LoginParams, onSuccess?: (auth: AuthenticatedUser) => void, onError?: (err: ApiError) => void, reauthenticationCallback?: () => void) => {
    const options = await fetchConfig("POST", params);
    return appFetch(
        "/users/login",
        options,
        (auth) => { processLoginSignUp(auth, reauthenticationCallback, onSuccess); },
        onError
    );
};

export const logout = async () => {
    await removeServiceToken();
    await AsyncStorage.removeItem(config.AUTH_USER_KEY);
    useUserStore.getState().clearUser();
};

export const updateProfile = async (
    firstName: string,
    lastName: string,
    onSuccess?: (user: User) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT", { firstName, lastName });
    return appFetch(
        "/users/me",
        options,
        async (user: User) => {
            await AsyncStorage.setItem(config.AUTH_USER_KEY, JSON.stringify(user));
            useUserStore.getState().setUser(user);
            if (onSuccess) onSuccess(user);
        },
        onError
    );
};

export const uploadUserAvatar = async (
    localUri: string,
    onSuccess?: (user: User) => void,
    onError?: (err: ApiError) => void
) => {
    const form = new FormData();
    form.append("file", {
        uri: localUri,
        name: "avatar.jpg",
        type: "image/jpeg",
    } as any);

    const options = await fetchConfig("PUT", form);
    return appFetch(
        "/users/me/avatar",
        options,
        async (user: User) => {
            await AsyncStorage.setItem(config.AUTH_USER_KEY, JSON.stringify(user));
            useUserStore.getState().setUser(user);
            if (onSuccess) onSuccess(user);
        },
        onError
    );
};

export const changePassword = async (
    oldPassword: string,
    newPassword: string,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT", { oldPassword, newPassword });
    return appFetch(
        "/users/me/password",
        options,
        () => { if (onSuccess) onSuccess(); },
        onError
    );
};
