import { ApiError, appFetch, fetchConfig } from "../appFetch";
import { Block } from "../block";
import type { ProductUnit } from "../products/productService";

export type ShoppingListStatus = "ACTIVE" | "COMPLETED";

export type ShoppingListItem = {
    id: number;
    productId?: number | null;
    productName?: string | null;
    productImage?: string | null;
    customProductName?: string | null;
    customProductBrand?: string | null;
    quantity?: number | null;
    unit?: ProductUnit | null;
    checked: boolean;
    autoAdded: boolean;
    checkedByName?: string | null;
    checkedAt?: string | null;
    addedByNames: string[];
};

export type ShoppingList = {
    id: number;
    status: ShoppingListStatus;
    createdAt: string;
    completedAt?: string | null;
    createdByName?: string | null;
    items: ShoppingListItem[];
};

export type ShoppingListSummary = {
    id: number;
    status: ShoppingListStatus;
    createdAt: string;
    completedAt?: string | null;
    createdByName?: string | null;
    items: ShoppingListItem[];
};

export type AddShoppingListItemParams = {
    productId?: number | null;
    customProductName?: string | null;
    customProductBrand?: string | null;
    quantity?: number | null;
    unit?: ProductUnit | null;
};

export type FinalizeShoppingListResult = {
    checkedKnownItems: ShoppingListItem[];
    checkedCustomItems: ShoppingListItem[];
};

export const createShoppingList = async (
    householdId: number,
    onSuccess?: (list: ShoppingList) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST");
    return appFetch(`/shopping-lists/${householdId}`, options, onSuccess, onError);
};

export const getActiveShoppingList = async (
    householdId: number,
    onSuccess?: (list: ShoppingList) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/shopping-lists/${householdId}/active`, options, onSuccess, onError);
};

export const getShoppingLists = async (
    householdId: number,
    page: number,
    onSuccess?: (block: Block<ShoppingListSummary>) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/shopping-lists/${householdId}?page=${page}`, options, onSuccess, onError);
};

export const addItemToList = async (
    listId: number,
    params: AddShoppingListItemParams,
    onSuccess?: (item: ShoppingListItem) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST", params);
    return appFetch(`/shopping-lists/${listId}/items`, options, onSuccess, onError);
};

export const toggleItemChecked = async (
    listId: number,
    itemId: number,
    onSuccess?: (item: ShoppingListItem) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT");
    return appFetch(`/shopping-lists/${listId}/items/${itemId}/toggle`, options, onSuccess, onError);
};

export const removeItemFromList = async (
    listId: number,
    itemId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/shopping-lists/${listId}/items/${itemId}`, options, onSuccess, onError);
};

export const finalizeShoppingList = async (
    listId: number,
    force: boolean,
    onSuccess?: (result: FinalizeShoppingListResult) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST", { force });
    return appFetch(`/shopping-lists/${listId}/finalize`, options, onSuccess, onError);
};

export const deleteShoppingList = async (
    listId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/shopping-lists/${listId}`, options, onSuccess, onError);
};
