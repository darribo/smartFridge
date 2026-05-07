import { ApiError, appFetch, fetchConfig } from "../appFetch";

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type RecipeCuisineType = "SPANISH" | "ITALIAN" | "MEXICAN" | "ASIAN" | "AMERICAN" | "FRENCH" | "MEDITERRANEAN" | "OTHER";
export type RecipeDietType = "STANDARD" | "VEGETARIAN" | "VEGAN" | "GLUTEN_FREE" | "DAIRY_FREE" | "KETO" | "OTHER";
export type RecipeMealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "DESSERT" | "OTHER";
export type RecipeSeasonType = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER" | "ALL_YEAR";
export type RecipeGenerationSource = "USER" | "LLM" | "IMPORTED";
export type RecipeIngredientUnit = "G" | "KG" | "ML" | "L" | "UNIT";

export type NewRecipeIngredientParams = {
    name: string;
    quantityValue?: string | null;
    unit?: RecipeIngredientUnit | null;
    notes?: string | null;
    optionalIngredient?: boolean;
    displayOrder: number;
    productId?: number | null;
};

export type NewRecipeParams = {
    title: string;
    description?: string | null;
    servings?: number | null;
    preparationMinutes?: number | null;
    cookingMinutes?: number | null;
    totalMinutes?: number | null;
    difficulty?: RecipeDifficulty | null;
    cuisineType?: RecipeCuisineType | null;
    dietType?: RecipeDietType | null;
    mealType?: RecipeMealType | null;
    seasonType?: RecipeSeasonType | null;
    vegetarian?: boolean | null;
    vegan?: boolean | null;
    instructions: string;
    notes?: string | null;
    generationSource: RecipeGenerationSource;
    ingredients?: NewRecipeIngredientParams[] | null;
};

export type RecipeIngredient = {
    id: number;
    name: string;
    quantityValue?: string | null;
    unit?: RecipeIngredientUnit | null;
    notes?: string | null;
    optionalIngredient: boolean;
    displayOrder: number;
    productId?: number | null;
};

export type Recipe = {
    id: number;
    createdByUserId: number;
    title: string;
    image?: string | null;
    description?: string | null;
    servings?: number | null;
    preparationMinutes?: number | null;
    cookingMinutes?: number | null;
    totalMinutes?: number | null;
    difficulty?: RecipeDifficulty | null;
    cuisineType?: RecipeCuisineType | null;
    dietType?: RecipeDietType | null;
    mealType?: RecipeMealType | null;
    seasonType?: RecipeSeasonType | null;
    vegetarian?: boolean | null;
    vegan?: boolean | null;
    instructions: string;
    notes?: string | null;
    generationSource: RecipeGenerationSource;
    createdAt: string;
    updatedAt: string;
    ingredients: RecipeIngredient[];
};

export type RecipeSummary = {
    id: number;
    title: string;
    image?: string | null;
    totalMinutes?: number | null;
    difficulty?: RecipeDifficulty | null;
    mealType?: RecipeMealType | null;
};

export const createRecipe = async (
    householdId: number,
    params: NewRecipeParams,
    onSuccess?: (recipe: Recipe) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST", params);
    return appFetch(`/recipes?householdId=${householdId}`, options, onSuccess, onError);
};

export const getRecipe = async (
    recipeId: number,
    onSuccess?: (recipe: Recipe) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/recipes/${recipeId}`, options, onSuccess, onError);
};

export const updateRecipe = async (
    recipeId: number,
    params: NewRecipeParams,
    onSuccess?: (recipe: Recipe) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("PUT", params);
    return appFetch(`/recipes/${recipeId}`, options, onSuccess, onError);
};

export const deleteRecipe = async (
    recipeId: number,
    onSuccess?: () => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("DELETE");
    return appFetch(`/recipes/${recipeId}`, options, onSuccess, onError);
};

export type GenerateAiRecipeParams = {
    difficulty?: RecipeDifficulty | null;
    cuisineType?: RecipeCuisineType | null;
    dietType?: RecipeDietType | null;
    mealType?: RecipeMealType | null;
    seasonType?: RecipeSeasonType | null;
    servings?: number | null;
    vegetarian?: boolean | null;
    vegan?: boolean | null;
    mustIncludeProductIds?: number[] | null;
    excludeTitles?: string[] | null;
};

export const generateAiRecipe = async (
    householdId: number,
    params: GenerateAiRecipeParams,
    onSuccess?: (recipe: NewRecipeParams) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST", params);
    return appFetch(`/recipes/generate-ai?householdId=${householdId}`, options, onSuccess, onError);
};

export type RecipeFilters = {
    title?: string | null;
    minMinutes?: number | null;
    maxMinutes?: number | null;
    difficulty?: RecipeDifficulty | null;
    mealType?: RecipeMealType | null;
    cuisineType?: RecipeCuisineType | null;
    dietType?: RecipeDietType | null;
    seasonType?: RecipeSeasonType | null;
    isVegetarian?: boolean | null;
    isVegan?: boolean | null;
    productIds?: number[] | null;
};

export type RecipeSummaryBlock = {
    items: RecipeSummary[];
    existMoreItems: boolean;
};

export type CookIngredientPreviewLine = {
    ingredientId: number;
    ingredientName: string;
    requiredQuantity: string | null;
    availableQuantity: string | null;
    sufficient: boolean;
    optional: boolean;
    productId: number;
    unit: string | null;
};

export type CookRecipePreview = {
    canCookFully: boolean;
    lines: CookIngredientPreviewLine[];
};

export type CookedRecipe = {
    id: number;
    recipeId: number | null;
    cookedAt: string;
};

export const previewCookRecipe = async (
    recipeId: number,
    onSuccess?: (preview: CookRecipePreview) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("GET");
    return appFetch(`/recipes/${recipeId}/cook-preview`, options, onSuccess, onError);
};

export const cookRecipe = async (
    recipeId: number,
    forcePartial: boolean,
    onSuccess?: (result: CookedRecipe) => void,
    onError?: (err: ApiError) => void
) => {
    const options = await fetchConfig("POST", { forcePartial });
    return appFetch(`/recipes/${recipeId}/cook`, options, onSuccess, onError);
};

export const uploadRecipeImage = async (
    recipeId: number,
    localUri: string,
    onSuccess?: (recipe: Recipe) => void,
    onError?: (err: ApiError) => void
) => {
    const form = new FormData();
    form.append("file", {
        uri: localUri,
        name: `recipe_${recipeId}.jpg`,
        type: "image/jpeg",
    } as any);
    const options = await fetchConfig("POST", form);
    return appFetch(`/recipes/${recipeId}/images`, options, onSuccess, onError);
};

export const findRecipes = async (
    householdId: number,
    filters: RecipeFilters,
    page: number,
    onSuccess?: (block: RecipeSummaryBlock) => void,
    onError?: (err: ApiError) => void
) => {
    const params = new URLSearchParams();
    params.append("householdId", String(householdId));
    params.append("page", String(page));

    if (filters.title) params.append("title", filters.title);
    if (filters.minMinutes != null) params.append("minMinutes", String(filters.minMinutes));
    if (filters.maxMinutes != null) params.append("maxMinutes", String(filters.maxMinutes));
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.mealType) params.append("mealType", filters.mealType);
    if (filters.cuisineType) params.append("cuisineType", filters.cuisineType);
    if (filters.dietType) params.append("dietType", filters.dietType);
    if (filters.seasonType) params.append("seasonType", filters.seasonType);
    if (filters.isVegetarian != null) params.append("isVegetarian", String(filters.isVegetarian));
    if (filters.isVegan != null) params.append("isVegan", String(filters.isVegan));
    if (filters.productIds && filters.productIds.length > 0) {
        filters.productIds.forEach(id => params.append("productIds", String(id)));
    }

    const options = await fetchConfig("GET");
    return appFetch(`/recipes?${params.toString()}`, options, onSuccess, onError);
};
