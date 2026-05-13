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
    daysAfterOpening?: number | null;
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
    daysAfterOpening?: number | null;
    hasActiveItems?: boolean | null;
    version: number;
}

export type ProductItem = {
    id: number;
    productId: number;
    purchaseDate?: string | null;
    expirationDate?: string | null;
    pricePaid?: string | null;
    storageLocation: ProductItemStorageLocation;
    openedAt?: string | null;
    initialQuantityValue?: string | null;
    quantityRemainingValue?: string | null;
    version: number;
}

export type ProductDetail = {
    id: number;
    barcode?: string | null;
    name: string;
    brand?: string | null;
    defaultPrice?: string | null;
    image?: string | null;
    quantity?: string | null;
    unit: ProductUnit;
    isVegetarian: boolean;
    isVegan: boolean;
    nutriScoreGrade?: ProductNutriScoreGrade | null;
    novaGroup?: ProductNovaGroup | null;
    createdAt: string;
    daysAfterOpening?: number | null;
    items: ProductItem[];
    version: number;
}

export type ProductWithItems = {
    id: number;
    name: string;
    image?: string | null;
    quantity?: string | null;
    unit: ProductUnit;
    countItems: number;
    items: ProductItem[];
    hasActiveItems: boolean;
    isFavorite: boolean;
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

export type ExpiringProduct = {
    id: number | null;
    productId: number;
    productName: string;
    productImage?: string | null;
    daysRemaining: number;
}

export type LittleStockProduct = {
    id: number | null;
    productId: number;
    productName: string;
    productImage?: string | null;
    quantityRemainingValue?: string | null;
    initialQuantityValue?: string | null;
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
    initialQuantityValue: string | null,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const body = {
        purchaseDate,
        expirationDate,
        pricePaid,
        storageLocation,
        initialQuantityValue,
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

export const getProductDetail = async (
    productId: number,
    onSuccess?: (product: ProductDetail) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");

    return appFetch(
        `/products/${productId}/detail`,
        options,
        onSuccess,
        onError
    );
};

export type UpdateProductParams = {
    name: string;
    brand?: string | null;
    defaultPrice?: string | null;
    quantity: string;
    unit: ProductUnit;
    isVegetarian?: boolean | null;
    isVegan?: boolean | null;
    nutriScoreGrade?: ProductNutriScoreGrade | null;
    novaGroup?: ProductNovaGroup | null;
    daysAfterOpening?: number | null;
    version: number;
}

export type UpdateProductItemParams = {
    expirationDate?: string | null;
    pricePaid?: string | null;
    storageLocation: ProductItemStorageLocation;
    initialQuantityValue?: string | null;
    version: number;
}

export const updateProduct = async (
    productId: number,
    params: UpdateProductParams,
    onSuccess?: (product: Product) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT", params);
    return appFetch(`/products/${productId}`, options, onSuccess, onError);
};

export const deleteProduct = async (
    productId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/products/${productId}`, options, onSuccess, onError);
};

export const updateProductItem = async (
    productId: number,
    itemId: number,
    params: UpdateProductItemParams,
    onSuccess?: (item: ProductItem) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT", params);
    return appFetch(`/products/${productId}/items/${itemId}`, options, onSuccess, onError);
};

export const deleteProductItem = async (
    productId: number,
    itemId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/products/${productId}/items/${itemId}`, options, onSuccess, onError);
};

export const discardProductItem = async (
    itemId: number,
    onSuccess?: (item: ProductItem) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST");
    return appFetch(`/products/${itemId}/discard`, options, onSuccess, onError);
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


export const getExpiringProducts = async (
    householdId: number,
    page: number,
    onSuccess?: (block: Block<ExpiringProduct>) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");

    return appFetch(
        `/products/${householdId}/expiring?page=${page}`,
        options,
        onSuccess,
        onError
    );
};

export const countExpiringProducts = async (
    householdId: number,
    onSuccess?: (count: number) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/products/${householdId}/count/expiring`, options, onSuccess, onError);
};

export const getLittleStockProducts = async (
    householdId: number,
    page: number,
    onSuccess?: (block: Block<LittleStockProduct>) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(
        `/products/${householdId}/littleStock?page=${page}`,
        options,
        onSuccess,
        onError
    );
};

export const countLittleStockProducts = async (
    householdId: number,
    onSuccess?: (count: number) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/products/${householdId}/count/littleStock`, options, onSuccess, onError);
};

export const countPantryItems = async (
    householdId: number,
    onSuccess?: (count: number) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/products/${householdId}/count/items`, options, onSuccess, onError);
};

export const addFavoriteProduct = async (
    productId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST");
    return appFetch(`/products/${productId}/favorite`, options, onSuccess, onError);
};

export const removeFavoriteProduct = async (
    productId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/products/${productId}/favorite`, options, onSuccess, onError);
};
