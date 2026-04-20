import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DropdownField, OptionalBooleanField } from "../../screens/products/AddProductShared";
import { PrimaryButton } from "../PrimaryButton";
import { THEME } from "../../theme/theme";
import type {
    GenerateAiRecipeParams,
    RecipeCuisineType,
    RecipeDietType,
    RecipeDifficulty,
    RecipeMealType,
    RecipeSeasonType,
} from "../../api/recipes/recipeService";
import { searchProductsByName } from "../../api/products/productService";

type Props = {
    visible: boolean;
    householdId: number;
    initialProducts?: Array<{ id: number; name: string }>;
    onGenerate: (params: GenerateAiRecipeParams) => void;
    onClose: () => void;
};

export default function GenerateAiFiltersModal({ visible, householdId, initialProducts, onGenerate, onClose }: Props) {
    const { t } = useTranslation();

    const [difficulty, setDifficulty] = useState<RecipeDifficulty | "">("");
    const [cuisineType, setCuisineType] = useState<RecipeCuisineType | "">("");
    const [dietType, setDietType] = useState<RecipeDietType | "">("");
    const [mealType, setMealType] = useState<RecipeMealType | "">("");
    const [seasonType, setSeasonType] = useState<RecipeSeasonType | "">("");
    const [servings, setServings] = useState("");
    const [vegetarian, setVegetarian] = useState<boolean | null>(null);
    const [vegan, setVegan] = useState<boolean | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Array<{ id: number; name: string }>>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string }>>([]);

    useEffect(() => {
        if (visible && initialProducts && initialProducts.length > 0) {
            setSelectedProducts(initialProducts);
        }
    }, [visible]);

    const resetFilters = () => {
        setDifficulty("");
        setCuisineType("");
        setDietType("");
        setMealType("");
        setSeasonType("");
        setServings("");
        setVegetarian(null);
        setVegan(null);
        setSelectedProducts([]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleClose = () => {
        resetFilters();
        onClose();
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if(!query.trim()) {
            setSearchResults([]);
            return;
        }

        await searchProductsByName(
            householdId,
            query,
            0,
            (block) => setSearchResults(block.items.map(p => ({ id: p.id, name: p.name }))),
            () => setSearchResults([])
        );
    };

    const handleSelectProduct = (product: { id: number; name: string }) => {
        if(selectedProducts.some(p => p.id === product.id)) return;
        setSelectedProducts((prev) => [...prev, product]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveProduct = (productId: number) => {
        setSelectedProducts((prev) => prev.filter(p => p.id !== productId));
    };

    const handleGenerate = () => {
        const params: GenerateAiRecipeParams = {
            difficulty: difficulty || null,
            cuisineType: cuisineType || null,
            dietType: dietType || null,
            mealType: mealType || null,
            seasonType: seasonType || null,
            servings: servings ? parseInt(servings, 10) : null,
            vegetarian,
            vegan,
            mustIncludeProductIds: selectedProducts.length > 0 ? selectedProducts.map((p) => p.id) : null,
        };
        resetFilters();
        onGenerate(params);
    };

    const none = t("addRecipe.fields.none");

    const difficultyOptions: Array<{ label: string; value: RecipeDifficulty | "" }> = [
        { label: none, value: "" },
        { label: t("addRecipe.difficulty.EASY"), value: "EASY" },
        { label: t("addRecipe.difficulty.MEDIUM"), value: "MEDIUM" },
        { label: t("addRecipe.difficulty.HARD"), value: "HARD" },
    ];

    const cuisineOptions: Array<{ label: string; value: RecipeCuisineType | "" }> = [
        { label: none, value: "" },
        { label: t("addRecipe.cuisineType.SPANISH"), value: "SPANISH" },
        { label: t("addRecipe.cuisineType.ITALIAN"), value: "ITALIAN" },
        { label: t("addRecipe.cuisineType.MEXICAN"), value: "MEXICAN" },
        { label: t("addRecipe.cuisineType.ASIAN"), value: "ASIAN" },
        { label: t("addRecipe.cuisineType.AMERICAN"), value: "AMERICAN" },
        { label: t("addRecipe.cuisineType.FRENCH"), value: "FRENCH" },
        { label: t("addRecipe.cuisineType.MEDITERRANEAN"), value: "MEDITERRANEAN" },
        { label: t("addRecipe.cuisineType.OTHER"), value: "OTHER" },
    ];

    const dietOptions: Array<{ label: string; value: RecipeDietType | "" }> = [
        { label: none, value: "" },
        { label: t("addRecipe.dietType.STANDARD"), value: "STANDARD" },
        { label: t("addRecipe.dietType.VEGETARIAN"), value: "VEGETARIAN" },
        { label: t("addRecipe.dietType.VEGAN"), value: "VEGAN" },
        { label: t("addRecipe.dietType.GLUTEN_FREE"), value: "GLUTEN_FREE" },
        { label: t("addRecipe.dietType.DAIRY_FREE"), value: "DAIRY_FREE" },
        { label: t("addRecipe.dietType.KETO"), value: "KETO" },
        { label: t("addRecipe.dietType.OTHER"), value: "OTHER" },
    ];

    const mealOptions: Array<{ label: string; value: RecipeMealType | "" }> = [
        { label: none, value: "" },
        { label: t("addRecipe.mealType.BREAKFAST"), value: "BREAKFAST" },
        { label: t("addRecipe.mealType.LUNCH"), value: "LUNCH" },
        { label: t("addRecipe.mealType.DINNER"), value: "DINNER" },
        { label: t("addRecipe.mealType.SNACK"), value: "SNACK" },
        { label: t("addRecipe.mealType.DESSERT"), value: "DESSERT" },
        { label: t("addRecipe.mealType.OTHER"), value: "OTHER" },
    ];

    const seasonOptions: Array<{ label: string; value: RecipeSeasonType | "" }> = [
        { label: none, value: "" },
        { label: t("addRecipe.seasonType.SPRING"), value: "SPRING" },
        { label: t("addRecipe.seasonType.SUMMER"), value: "SUMMER" },
        { label: t("addRecipe.seasonType.AUTUMN"), value: "AUTUMN" },
        { label: t("addRecipe.seasonType.WINTER"), value: "WINTER" },
        { label: t("addRecipe.seasonType.ALL_YEAR"), value: "ALL_YEAR" },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={styles.container}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <View style={styles.titleRow}>
                        <View>
                            <Text style={styles.title}>{t("addRecipe.ai.filtersTitle")}</Text>
                            <Text style={styles.subtitle}>{t("addRecipe.ai.filtersSubtitle")}</Text>
                        </View>
                        <Pressable onPress={handleClose} hitSlop={10}>
                            <MaterialCommunityIcons name="close" size={22} color={THEME.muted} />
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <DropdownField
                            label={t("addRecipe.fields.difficulty")}
                            options={difficultyOptions as Array<{ label: string; value: RecipeDifficulty }>}
                            value={difficulty as RecipeDifficulty}
                            onChange={(v) => setDifficulty(v as RecipeDifficulty | "")}
                        />

                        <DropdownField
                            label={t("addRecipe.fields.mealType")}
                            options={mealOptions as Array<{ label: string; value: RecipeMealType }>}
                            value={mealType as RecipeMealType}
                            onChange={(v) => setMealType(v as RecipeMealType | "")}
                        />

                        <DropdownField
                            label={t("addRecipe.fields.cuisineType")}
                            options={cuisineOptions as Array<{ label: string; value: RecipeCuisineType }>}
                            value={cuisineType as RecipeCuisineType}
                            onChange={(v) => setCuisineType(v as RecipeCuisineType | "")}
                        />

                        <DropdownField
                            label={t("addRecipe.fields.dietType")}
                            options={dietOptions as Array<{ label: string; value: RecipeDietType }>}
                            value={dietType as RecipeDietType}
                            onChange={(v) => setDietType(v as RecipeDietType | "")}
                        />

                        <DropdownField
                            label={t("addRecipe.fields.seasonType")}
                            options={seasonOptions as Array<{ label: string; value: RecipeSeasonType }>}
                            value={seasonType as RecipeSeasonType}
                            onChange={(v) => setSeasonType(v as RecipeSeasonType | "")}
                        />

                        <View style={styles.servingsField}>
                            <Text style={styles.servingsLabel}>{t("addRecipe.fields.servings")}</Text>
                            <TextInput
                                style={styles.servingsInput}
                                value={servings}
                                onChangeText={setServings}
                                placeholder={t("addRecipe.ai.servingsPlaceholder")}
                                placeholderTextColor={THEME.muted}
                                keyboardType="number-pad"
                            />
                        </View>

                        <OptionalBooleanField
                            label={t("addRecipe.fields.vegetarian")}
                            icon="leaf"
                            yesText={t("common.yes")}
                            noText={t("common.no")}
                            value={vegetarian}
                            onChange={setVegetarian}
                        />

                        <OptionalBooleanField
                            label={t("addRecipe.fields.vegan")}
                            icon="sprout"
                            yesText={t("common.yes")}
                            noText={t("common.no")}
                            value={vegan}
                            onChange={setVegan}
                        />

                        <View style={styles.productsSection}>
                            <Text style={styles.servingsLabel}>{t("addRecipe.ai.mustIncludeProducts")}</Text>
                            <TextInput
                                style={styles.servingsInput}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                placeholder={t("addRecipe.ai.searchProductsPlaceholder")}
                                placeholderTextColor={THEME.muted}
                            />
                            {searchResults.length > 0 && (
                                <View style={styles.searchResults}>
                                    {searchResults.map((p) => (
                                        <Pressable key={p.id} style={styles.resultItem} onPress={() => handleSelectProduct(p)}>
                                            <Text style={styles.resultName}>{p.name}</Text>
                                            <MaterialCommunityIcons name="plus" size={18} color={THEME.primary} />
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                            {selectedProducts.length > 0 && (
                                <View style={styles.chips}>
                                    {selectedProducts.map((p) => (
                                        <View key={p.id} style={styles.chip}>
                                            <Text style={styles.chipText}>{p.name}</Text>
                                            <Pressable onPress={() => handleRemoveProduct(p.id)} hitSlop={6}>
                                                <MaterialCommunityIcons name="close" size={14} color={THEME.muted} />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={styles.actions}>
                            <PrimaryButton
                                text={t("addRecipe.ai.generate")}
                                onPress={handleGenerate}
                            />
                            <Pressable style={styles.cancelBtn} onPress={handleClose}>
                                <Text style={styles.cancelText}>{t("addRecipe.ai.cancel")}</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(14, 26, 19, 0.45)",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: "85%",
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 4,
        backgroundColor: "#D5DCE2",
        alignSelf: "center",
        marginBottom: 14,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: THEME.text,
    },
    subtitle: {
        fontSize: 13,
        color: THEME.muted,
        marginTop: 2,
    },
    scroll: {
        flexGrow: 0,
    },
    servingsField: {
        marginBottom: 12,
    },
    servingsLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: THEME.text,
        marginBottom: 6,
    },
    servingsInput: {
        height: 54,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "#F8FCFA",
        paddingHorizontal: 18,
        fontSize: 16,
        color: THEME.text,
    },
    productsSection: {
        marginBottom: 12,
    },
    searchResults: {
        marginTop: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.surface,
        overflow: "hidden",
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    resultName: {
        fontSize: 15,
        color: THEME.text,
        fontWeight: "600",
        flexShrink: 1,
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: THEME.mint,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: THEME.text,
    },
    actions: {
        marginTop: 8,
        gap: 4,
    },
    cancelBtn: {
        alignSelf: "center",
        paddingVertical: 10,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: THEME.muted,
    },
});
