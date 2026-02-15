import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "../config/constants";
import i18n from "../i18n/i18n";

//Formato de error definido
export type ApiError = {
  globalErrors: string[];
  fieldErrors?: Record<string, string[] | string>;
  isTimeout?: boolean;
  [k: string]: any;
};

let networkErrorCallback: ((e: ApiError) => void) | undefined;
let reauthenticationCallback: (() => void) | undefined;
let lastRequestCallback: (() => Promise<void>) | undefined;

export const init = (cb: (e: ApiError) => void) => (networkErrorCallback = cb);
export const setReauthenticationCallback = (cb: () => void) => (reauthenticationCallback = cb);

export const setServiceToken = async (token: string) =>
  AsyncStorage.setItem(config.SERVICE_TOKEN_KEY, token);

export const getServiceToken = async () =>
  AsyncStorage.getItem(config.SERVICE_TOKEN_KEY);

export const removeServiceToken = async () =>
  AsyncStorage.removeItem(config.SERVICE_TOKEN_KEY);

export const retryLastRequest = async () => {
  if (!lastRequestCallback) return false;
  await lastRequestCallback();
  return true;
};

const isJson = (response: Response) => {
  const contentType = response.headers.get("content-type");
  return !!contentType && contentType.includes("application/json");
};

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeError = (payload: any, status: number): ApiError => {
  if (!payload || typeof payload !== "object") return { globalErrors: [`Error HTTP ${status}`] };

  if (Array.isArray(payload.globalErrors)) return payload;
  if (typeof payload.globalError === "string") return { ...payload, globalErrors: [payload.globalError] };
  if (typeof payload.message === "string") return { ...payload, globalErrors: [payload.message] };

  return { ...payload, globalErrors: [`Error HTTP ${status}`] };
};

export const fetchConfig = async (method: string, body?: any): Promise<RequestInit> => {
  const headers: Record<string, string> = {};
  const cfg: RequestInit = { method, headers };

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      cfg.body = body as any;
    } else {
      headers["Content-Type"] = "application/json";
      cfg.body = JSON.stringify(body);
    }
  }

  const token = await getServiceToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return cfg;
};

export const appFetch = async <T = any>(
  path: string,
  options: RequestInit,
  onSuccess?: (payload: T) => void,
  onErrors?: (err: ApiError) => void,
  trackAsLastRequest = true
) => {
  const url = `${config.BASE_URL}${path}`;
  if (trackAsLastRequest) {
    lastRequestCallback = async () => {
      await appFetch(path, options, onSuccess, onErrors, false);
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, config.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      if (!onSuccess) return;

      if (response.status === 204) {
        onSuccess(undefined as unknown as T);
        return;
      }

      if (isJson(response)) {
        const payload = (await safeJson(response)) as T;
        onSuccess(payload);
      } else {
        const blob = await response.blob();
        onSuccess(blob as unknown as T);
      }
      return;
    }

    if (response.status === 401 && reauthenticationCallback) reauthenticationCallback();

    let payload: any = null;
    if (isJson(response)) payload = await safeJson(response);

    const err = normalizeError(payload, response.status);

    if (onErrors) onErrors(err);
    else if (networkErrorCallback) networkErrorCallback(err);
    else console.error("appFetch error:", err);
  } catch (e: any) {
    clearTimeout(timeoutId);
    const isTimeout = e?.name === "AbortError";
    const err: ApiError = {
      globalErrors: [
        isTimeout ? i18n.t("common.timeoutError") : i18n.t("common.networkError"),
      ],
      isTimeout,
    };

    if (onErrors) onErrors(err);
    else if (networkErrorCallback) networkErrorCallback(err);
    else console.error("appFetch network error:", err);
  }
};
