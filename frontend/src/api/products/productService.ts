import { ApiError, appFetch, fetchConfig } from "../appFetch";
import { Block } from "../block";

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

export type ProductUnit = 'g' | 'kg' | 'ml' | 'l' | 'unit' | 'G' | 'KG' | 'ML' | 'L' | 'UNIT';

export type ProductNutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type ProductNovaGroup = 1 | 2 | 3 | 4 | "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";


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

