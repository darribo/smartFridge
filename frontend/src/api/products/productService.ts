import { ApiError, appFetch, fetchConfig } from "../appFetch";
import { Block } from "../block";
import type { Allergy } from "../allergies/allergyService";

export type NewProductParams = {
    barcode?: string | null;
    name: string;
    brand?: string | null;
    defaultPrice?: string | null;
    image?: string | null;
    quantity: string;
    unit: ProductUnit;
    isVegetarian?: boolean | null;
    isVegan?: boolean | null;
    nutriScoreGrade?: ProductNutriScoreGrade | null;
    novaGroup?: ProductNovaGroup | null;
    allergyIds?: number[] | null;
}

export type Product = {
    id: number;
    barcode?: string;
    name: string;
    brand?: string;
    defaultPrice?: string;
    image?: string;
    quantity: string;
    unit: ProductUnit;
    isVegetarian: boolean;
    isVegan: boolean;
    nutriScoreGrade?: ProductNutriScoreGrade;
    novaGroup?: ProductNovaGroup;
    createdAt: string; // ISO 8601 format
}

export type ProductItem = {
    id: number;
    productId: number;
    purchaseDate?: string | null;
    expirationDate?: string | null;
    pricePaid?: string | null;
    storageLocation: ProductItemStorageLocation;
}

export type ProductWithItems = {
    id: number;
    name: string;
    image?: string | null;
    quantity?: string | null;
    unit: ProductUnit;
    countItems: number;
    items: ProductItem[];
}

export type ProductUnit = 'g' | 'kg' | 'ml' | 'l' | 'unit' | 'G' | 'KG' | 'ML' | 'L' | 'UNIT';

export type ProductNutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type ProductNovaGroup = 1 | 2 | 3 | 4 | "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";
export type ProductItemStorageLocation = "PANTRY" | "FRIDGE" | "FREEZER";

export type ProductFilters = {
    name?: string;
    brand?: string;
    isVegetarian?: boolean | null;
    isVegan?: boolean | null;
    nutriScoreGrade?: ProductNutriScoreGrade | null;
    novaGroup?: ProductNovaGroup | null;
    storageLocation?: ProductItemStorageLocation | null;
}

export type BarcodeProduct = {
    id: number | null;
    barcode: string;
    name: string;
    brand?: string | null;
    defaultPrice?: number | string | null;
    image?: string | null;
    quantity?: number | string | null;
    unit?: ProductUnit | null;
    vegetarian?: boolean | null;
    vegan?: boolean | null;
    nutriScoreGrade?: ProductNutriScoreGrade | null;
    novaGroup?: ProductNovaGroup | null;
    allergies?: Allergy[] | null;
}


export const createProduct = async (householdId: number, params: NewProductParams, onSuccess?: (product: Product) => void, onError?: (err: ApiError) => void) => {

    const body = {
        householdId,
        ...params
    }
    
    const options = await fetchConfig("POST", body);

    return appFetch(
        "/products",
        options,
        onSuccess,
        onError
    );
}

export const searchProductsByName = async (
    householdId: number,
    name: string,
    page: number,
    onSuccess?: (block: Block<Product>) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");

    return appFetch(
        `/products/${householdId}/search?name=${encodeURIComponent(name)}&page=${page}`,
        options,
        onSuccess,
        onError
    );
};

export const findProducts = async (
    householdId: number,
    filters: ProductFilters,
    page: number,
    onSuccess?: (block: Block<ProductWithItems>) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    const params = new URLSearchParams();

    if (filters.name?.trim()) params.append("name", filters.name.trim());
    if (filters.brand?.trim()) params.append("brand", filters.brand.trim());
    if (filters.isVegetarian !== null && filters.isVegetarian !== undefined) {
        params.append("isVegetarian", String(filters.isVegetarian));
    }
    if (filters.isVegan !== null && filters.isVegan !== undefined) {
        params.append("isVegan", String(filters.isVegan));
    }
    if (filters.nutriScoreGrade) params.append("nutriScoreGrade", String(filters.nutriScoreGrade));
    if (filters.novaGroup) params.append("novaGroup", String(filters.novaGroup));
    if (filters.storageLocation) params.append("storageLocation", filters.storageLocation);
    params.append("page", String(page));

    return appFetch(
        `/products/${householdId}?${params.toString()}`,
        options,
        onSuccess,
        onError
    );
};

export const createProductItem = async (
    productId: number,
    purchaseDate: string | null,
    expirationDate: string | null,
    pricePaid: string | null,
    storageLocation: ProductItemStorageLocation,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const body = {
        purchaseDate,
        expirationDate,
        pricePaid,
        storageLocation
    };

    const options = await fetchConfig("POST", body);

    return appFetch(
        `/products/${productId}/items`,
        options,
        onSuccess,
        onError
    );
};

export const getProductByBarcode = async (
    householdId: number,
    barcode: string,
    onSuccess?: (product: BarcodeProduct) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");

    return appFetch(
        `/products/${householdId}/barcode?barcode=${encodeURIComponent(barcode)}`,
        options,
        onSuccess,
        onError
    );
};

export type SimplifiedUser = {
  id: number;
  userName: string;
};

export const checkAllergiesByIds = async (
  householdId: number,
  allergyIds: number[],
  onSuccess?: (users: SimplifiedUser[]) => void,
  onError?: (err: ApiError) => void
) => {
  const options = await fetchConfig("GET");
  const query = allergyIds.map((id) => `allergyIds=${id}`).join("&");

  return appFetch(
    `/products/${householdId}/checkAllergies?${query}`,
    options,
    onSuccess,
    onError
  );
};

export const uploadProductImage = async (
  productId: number,
  localUri: string,
  onSuccess?: (product: Product) => void,
  onError?: (err: ApiError) => void
) => {
  const form = new FormData();

  form.append("file", {
    uri: localUri,
    name: `product_${productId}.jpg`,
    type: "image/jpeg",
  } as any);

  const options = await fetchConfig("POST", form);

  return appFetch(
    `/products/${productId}/images`,
    options,
    onSuccess,
    onError
  );
};
