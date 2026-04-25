import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import { AuthStackParamList } from "../../navigation/AuthStack";
import { FormLabel } from "../../components/FormLabel";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { PrimaryButton } from "../../components/PrimaryButton";
import { DropdownField, OptionalBooleanField } from "../products/AddProductShared";
import { createRecipe, updateRecipe, generateAiRecipe } from "../../api/recipes/recipeService";
import type {
    RecipeDifficulty,
    RecipeCuisineType,
    RecipeDietType,
    RecipeMealType,
    RecipeSeasonType,
    RecipeIngredientUnit,
    NewRecipeIngredientParams,
    NewRecipeParams,
    GenerateAiRecipeParams,
} from "../../api/recipes/recipeService";
import LinkProductModal from "../../components/recipes/LinkProductModal";
import type { LinkedProduct } from "../../components/recipes/LinkProductModal";
import GenerateAiFiltersModal from "../../components/recipes/GenerateAiFiltersModal";
import { THEME } from "../../theme/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "AddRecipe">;

type IngredientRow = {
    name: string;
    quantityValue: string;
    unit: RecipeIngredientUnit | "";
    notes: string;
    optional: boolean;
    productId: number | null;
    productIsVegetarian?: boolean;
    productIsVegan?: boolean;
};

const DIFFICULTY_OPTIONS: Array<{ label: string; value: RecipeDifficulty }> = [
    { label: "Fácil", value: "EASY" },
    { label: "Media", value: "MEDIUM" },
    { label: "Difícil", value: "HARD" },
];

const CUISINE_OPTIONS: Array<{ label: string; value: RecipeCuisineType }> = [
    { label: "Española", value: "SPANISH" },
    { label: "Italiana", value: "ITALIAN" },
    { label: "Mexicana", value: "MEXICAN" },
    { label: "Asiática", value: "ASIAN" },
    { label: "Americana", value: "AMERICAN" },
    { label: "Francesa", value: "FRENCH" },
    { label: "Mediterránea", value: "MEDITERRANEAN" },
    { label: "Otra", value: "OTHER" },
];

const DIET_OPTIONS: Array<{ label: string; value: RecipeDietType }> = [
    { label: "Estándar", value: "STANDARD" },
    { label: "Vegetariana", value: "VEGETARIAN" },
    { label: "Vegana", value: "VEGAN" },
    { label: "Sin gluten", value: "GLUTEN_FREE" },
    { label: "Sin lácteos", value: "DAIRY_FREE" },
    { label: "Keto", value: "KETO" },
    { label: "Otra", value: "OTHER" },
];

const MEAL_OPTIONS: Array<{ label: string; value: RecipeMealType }> = [
    { label: "Desayuno", value: "BREAKFAST" },
    { label: "Comida", value: "LUNCH" },
    { label: "Cena", value: "DINNER" },
    { label: "Snack", value: "SNACK" },
    { label: "Postre", value: "DESSERT" },
    { label: "Otro", value: "OTHER" },
];

const SEASON_OPTIONS: Array<{ label: string; value: RecipeSeasonType }> = [
    { label: "Primavera", value: "SPRING" },
    { label: "Verano", value: "SUMMER" },
    { label: "Otoño", value: "AUTUMN" },
    { label: "Invierno", value: "WINTER" },
    { label: "Todo el año", value: "ALL_YEAR" },
];

const UNIT_OPTIONS: Array<{ label: string; value: RecipeIngredientUnit }> = [
    { label: "g", value: "G" },
    { label: "kg", value: "KG" },
    { label: "ml", value: "ML" },
    { label: "l", value: "L" },
    { label: "un", value: "UNIT" },
];

const emptyIngredient = (): IngredientRow => ({
    name: "",
    quantityValue: "",
    unit: "",
    notes: "",
    optional: false,
    productId: null,
});

export default function AddRecipeScreen({ navigation, route }: Props) {
    const { t } = useTranslation();
    const householdId = route.params?.householdId ?? 10;
    const initialRecipe = route.params?.initialRecipe;
    const recipeId = route.params?.recipeId;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instructions, setInstructions] = useState("");
    const [notes, setNotes] = useState("");
    const [servings, setServings] = useState("");
    const [prepMinutes, setPrepMinutes] = useState("");
    const [cookMinutes, setCookMinutes] = useState("");
    const [difficulty, setDifficulty] = useState<RecipeDifficulty | "">("");
    const [cuisineType, setCuisineType] = useState<RecipeCuisineType | "">("");
    const [dietType, setDietType] = useState<RecipeDietType | "">("");
    const [mealType, setMealType] = useState<RecipeMealType | "">("");
    const [seasonType, setSeasonType] = useState<RecipeSeasonType | "">("");
    const [vegetarian, setVegetarian] = useState<boolean | null>(null);
    const [vegan, setVegan] = useState<boolean | null>(null);
    const [ingredients, setIngredients] = useState<IngredientRow[]>([emptyIngredient()]);
    const [errors, setErrors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
    const [linkModal, setLinkModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });

    useEffect(() => {
        if (!initialRecipe) return;
        setTitle(initialRecipe.title ?? "");
        setDescription(initialRecipe.description ?? "");
        setInstructions(initialRecipe.instructions ?? "");
        setNotes(initialRecipe.notes ?? "");
        setServings(initialRecipe.servings != null ? String(initialRecipe.servings) : "");
        setPrepMinutes(initialRecipe.preparationMinutes != null ? String(initialRecipe.preparationMinutes) : "");
        setCookMinutes(initialRecipe.cookingMinutes != null ? String(initialRecipe.cookingMinutes) : "");
        setDifficulty(initialRecipe.difficulty ?? "");
        setCuisineType(initialRecipe.cuisineType ?? "");
        setDietType(initialRecipe.dietType ?? "");
        setMealType(initialRecipe.mealType ?? "");
        setSeasonType(initialRecipe.seasonType ?? "");
        setVegetarian(initialRecipe.vegetarian ?? null);
        setVegan(initialRecipe.vegan ?? null);
        if (initialRecipe.ingredients && initialRecipe.ingredients.length > 0) {
            setIngredients(initialRecipe.ingredients.map((ing) => ({
                name: ing.name,
                quantityValue: ing.quantityValue ?? "",
                unit: (ing.unit ?? "") as RecipeIngredientUnit | "",
                notes: ing.notes ?? "",
                optional: ing.optionalIngredient ?? false,
                productId: ing.productId ?? null,
            })));
        }
    }, []);

    const updateIngredient = (index: number, patch: Partial<IngredientRow>) => {
        setIngredients((prev) =>
            prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
        );
    };

    const addIngredient = () => {
        setIngredients((prev) => [...prev, emptyIngredient()]);
    };

    const removeIngredient = (index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleGenerateAi = async (params: GenerateAiRecipeParams) => {
        setErrors([]);
        setGeneratingAi(true);
        await generateAiRecipe(
            householdId,
            { ...params, excludeTitles: generatedTitles.length > 0 ? generatedTitles : null },
            (recipe: NewRecipeParams) => {
                setGeneratingAi(false);
                if (recipe.title) setGeneratedTitles((prev) => [...prev, recipe.title]);
                setTitle(recipe.title ?? "");
                setDescription(recipe.description ?? "");
                setInstructions(recipe.instructions ?? "");
                setNotes(recipe.notes ?? "");
                setServings(recipe.servings != null ? String(recipe.servings) : "");
                setPrepMinutes(recipe.preparationMinutes != null ? String(recipe.preparationMinutes) : "");
                setCookMinutes(recipe.cookingMinutes != null ? String(recipe.cookingMinutes) : "");
                setDifficulty(recipe.difficulty ?? "");
                setCuisineType(recipe.cuisineType ?? "");
                setDietType(recipe.dietType ?? "");
                setMealType(recipe.mealType ?? "");
                setSeasonType(recipe.seasonType ?? "");
                setVegetarian(recipe.vegetarian ?? null);
                setVegan(recipe.vegan ?? null);
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                    setIngredients(recipe.ingredients.map((ing) => ({
                        name: ing.name,
                        quantityValue: ing.quantityValue ?? "",
                        unit: (ing.unit ?? "") as RecipeIngredientUnit | "",
                        notes: ing.notes ?? "",
                        optional: ing.optionalIngredient ?? false,
                        productId: ing.productId ?? null,
                    })));
                }
            },
            (err) => {
                setGeneratingAi(false);
                setErrors(err.globalErrors?.length ? err.globalErrors : [t("addRecipe.ai.error")]);
            }
        );
    };

    const handleSave = async () => {
        const validationErrors: string[] = [];
        if (!title.trim()) validationErrors.push(t("addRecipe.errors.titleRequired"));
        if (!instructions.trim()) validationErrors.push(t("addRecipe.errors.instructionsRequired"));

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setSaving(true);

        const validIngredients = ingredients.filter((ing) => ing.name.trim());
        const ingredientParams: NewRecipeIngredientParams[] = validIngredients.map((ing, i) => ({
            name: ing.name.trim(),
            quantityValue: ing.quantityValue.trim() || null,
            unit: ing.unit || null,
            notes: ing.notes.trim() || null,
            optionalIngredient: ing.optional,
            displayOrder: i,
            productId: ing.productId ?? null,
        }));

        const prep = prepMinutes ? parseInt(prepMinutes, 10) : 0;
        const cook = cookMinutes ? parseInt(cookMinutes, 10) : 0;
        const total = prep + cook > 0 ? prep + cook : null;

        const recipeParams = {
            title: title.trim(),
            description: description.trim() || null,
            instructions: instructions.trim(),
            notes: notes.trim() || null,
            servings: servings ? parseInt(servings, 10) : null,
            preparationMinutes: prep || null,
            cookingMinutes: cook || null,
            totalMinutes: total,
            difficulty: difficulty || null,
            cuisineType: cuisineType || null,
            dietType: dietType || null,
            mealType: mealType || null,
            seasonType: seasonType || null,
            vegetarian,
            vegan,
            generationSource: initialRecipe?.generationSource ?? "USER",
            ingredients: ingredientParams.length > 0 ? ingredientParams : null,
        } as NewRecipeParams;

        const onSuccess = () => {
            setSaving(false);
            setGeneratedTitles([]);
            navigation.goBack();
        };
        const onError = (err: { globalErrors?: string[] }) => {
            setSaving(false);
            setErrors(err.globalErrors?.length ? err.globalErrors : [t("addRecipe.errors.saveFailed")]);
        };

        if (recipeId) {
            await updateRecipe(recipeId, recipeParams, onSuccess, onError);
        } else {
            await createRecipe(recipeParams, onSuccess, onError);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>{t("addRecipe.title")}</Text>
                <Pressable
                    style={[styles.aiBtn, (generatingAi || saving) && styles.aiBtnDisabled]}
                    onPress={() => setShowAiModal(true)}
                    disabled={generatingAi || saving}
                    hitSlop={8}
                >
                    <MaterialCommunityIcons name="creation" size={18} color={generatingAi || saving ? THEME.muted : THEME.primary} />
                    <Text style={[styles.aiBtnText, (generatingAi || saving) && styles.aiBtnTextDisabled]}>
                        {t("addRecipe.actions.generateAi")}
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <GlobalErrorBox messages={errors} />

                {/* Información básica */}
                <Text style={styles.sectionTitle}>{t("addRecipe.sections.basic")}</Text>

                <View style={styles.field}>
                    <FormLabel text={t("addRecipe.fields.title")} />
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t("addRecipe.placeholders.title")}
                        placeholderTextColor={THEME.muted}
                        maxLength={150}
                    />
                </View>

                <View style={styles.field}>
                    <FormLabel text={t("addRecipe.fields.description")} />
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t("addRecipe.placeholders.description")}
                        placeholderTextColor={THEME.muted}
                        multiline
                        numberOfLines={3}
                        maxLength={2000}
                    />
                </View>

                {/* Instrucciones */}
                <Text style={styles.sectionTitle}>{t("addRecipe.sections.instructions")}</Text>

                <View style={styles.field}>
                    <FormLabel text={t("addRecipe.fields.instructions")} />
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={instructions}
                        onChangeText={setInstructions}
                        placeholder={t("addRecipe.placeholders.instructions")}
                        placeholderTextColor={THEME.muted}
                        multiline
                        numberOfLines={6}
                    />
                </View>

                <View style={styles.field}>
                    <FormLabel text={t("addRecipe.fields.notes")} />
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder={t("addRecipe.placeholders.notes")}
                        placeholderTextColor={THEME.muted}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Tiempos y raciones */}
                <Text style={styles.sectionTitle}>{t("addRecipe.sections.times")}</Text>

                <View style={styles.row}>
                    <View style={styles.rowHalf}>
                        <FormLabel text={t("addRecipe.fields.prepMinutes")} />
                        <TextInput
                            style={styles.input}
                            value={prepMinutes}
                            onChangeText={setPrepMinutes}
                            placeholder="0"
                            placeholderTextColor={THEME.muted}
                            keyboardType="number-pad"
                        />
                    </View>
                    <View style={styles.rowHalf}>
                        <FormLabel text={t("addRecipe.fields.cookMinutes")} />
                        <TextInput
                            style={styles.input}
                            value={cookMinutes}
                            onChangeText={setCookMinutes}
                            placeholder="0"
                            placeholderTextColor={THEME.muted}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                <View style={styles.fieldHalf}>
                    <FormLabel text={t("addRecipe.fields.servings")} />
                    <TextInput
                        style={styles.input}
                        value={servings}
                        onChangeText={setServings}
                        placeholder="0"
                        placeholderTextColor={THEME.muted}
                        keyboardType="number-pad"
                    />
                </View>

                {/* Características */}
                <Text style={styles.sectionTitle}>{t("addRecipe.sections.characteristics")}</Text>

                <DropdownField
                    label={t("addRecipe.fields.difficulty")}
                    options={[
                        { label: t("addRecipe.fields.none"), value: "" as RecipeDifficulty },
                        ...DIFFICULTY_OPTIONS,
                    ]}
                    value={difficulty as RecipeDifficulty}
                    onChange={(v) => setDifficulty(v === ("" as RecipeDifficulty) ? "" : v)}
                />

                <DropdownField
                    label={t("addRecipe.fields.cuisineType")}
                    options={[
                        { label: t("addRecipe.fields.none"), value: "" as RecipeCuisineType },
                        ...CUISINE_OPTIONS,
                    ]}
                    value={cuisineType as RecipeCuisineType}
                    onChange={(v) => setCuisineType(v === ("" as RecipeCuisineType) ? "" : v)}
                />

                <DropdownField
                    label={t("addRecipe.fields.dietType")}
                    options={[
                        { label: t("addRecipe.fields.none"), value: "" as RecipeDietType },
                        ...DIET_OPTIONS,
                    ]}
                    value={dietType as RecipeDietType}
                    onChange={(v) => setDietType(v === ("" as RecipeDietType) ? "" : v)}
                />

                <DropdownField
                    label={t("addRecipe.fields.mealType")}
                    options={[
                        { label: t("addRecipe.fields.none"), value: "" as RecipeMealType },
                        ...MEAL_OPTIONS,
                    ]}
                    value={mealType as RecipeMealType}
                    onChange={(v) => setMealType(v === ("" as RecipeMealType) ? "" : v)}
                />

                <DropdownField
                    label={t("addRecipe.fields.seasonType")}
                    options={[
                        { label: t("addRecipe.fields.none"), value: "" as RecipeSeasonType },
                        ...SEASON_OPTIONS,
                    ]}
                    value={seasonType as RecipeSeasonType}
                    onChange={(v) => setSeasonType(v === ("" as RecipeSeasonType) ? "" : v)}
                />

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

                {/* Ingredientes */}
                <Text style={styles.sectionTitle}>{t("addRecipe.sections.ingredients")}</Text>

                {ingredients.map((ing, index) => (
                    <View key={index} style={styles.ingredientCard}>
                        <View style={styles.ingredientHeader}>
                            <Text style={styles.ingredientIndex}>{index + 1}.</Text>
                            {ingredients.length > 1 && (
                                <Pressable onPress={() => removeIngredient(index)} hitSlop={8}>
                                    <MaterialCommunityIcons name="close" size={18} color={THEME.muted} />
                                </Pressable>
                            )}
                        </View>

                        <TextInput
                            style={styles.input}
                            value={ing.name}
                            onChangeText={(v) => updateIngredient(index, { name: v })}
                            placeholder={t("addRecipe.placeholders.ingredientName")}
                            placeholderTextColor={THEME.muted}
                        />

                        <TextInput
                            style={styles.input}
                            value={ing.quantityValue}
                            onChangeText={(v) => updateIngredient(index, { quantityValue: v })}
                            placeholder={t("addRecipe.placeholders.quantity")}
                            placeholderTextColor={THEME.muted}
                            keyboardType="decimal-pad"
                        />

                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            value={ing.notes}
                            onChangeText={(v) => updateIngredient(index, { notes: v })}
                            placeholder={t("addRecipe.placeholders.ingredientNotes")}
                            placeholderTextColor={THEME.muted}
                            multiline
                            numberOfLines={2}
                        />

                        <View style={styles.unitRow}>
                            {UNIT_OPTIONS.map((opt) => (
                                <Pressable
                                    key={opt.value}
                                    style={[
                                        styles.unitBtn,
                                        ing.unit === opt.value && styles.unitBtnActive,
                                    ]}
                                    onPress={() =>
                                        updateIngredient(index, {
                                            unit: ing.unit === opt.value ? "" : opt.value,
                                        })
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.unitBtnText,
                                            ing.unit === opt.value && styles.unitBtnTextActive,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <Pressable
                            style={styles.optionalRow}
                            onPress={() => updateIngredient(index, { optional: !ing.optional })}
                        >
                            <MaterialCommunityIcons
                                name={ing.optional ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={20}
                                color={ing.optional ? THEME.primary : THEME.muted}
                            />
                            <Text style={styles.optionalLabel}>{t("addRecipe.fields.optional")}</Text>
                        </Pressable>

                        <Pressable
                            style={styles.linkProductBtn}
                            onPress={() => setLinkModal({ open: true, index })}
                        >
                            <MaterialCommunityIcons
                                name={ing.productId ? "link-variant" : "link-variant-plus"}
                                size={14}
                                color={ing.productId ? THEME.primary : THEME.muted}
                            />
                            <Text style={[styles.linkProductText, ing.productId ? styles.linkProductTextLinked : null]}>
                                {ing.productId ? t("addRecipe.ingredient.linked") : t("addRecipe.ingredient.link")}
                            </Text>
                        </Pressable>
                    </View>
                ))}

                <Pressable style={styles.addIngredientBtn} onPress={addIngredient}>
                    <MaterialCommunityIcons name="plus" size={18} color={THEME.primary} />
                    <Text style={styles.addIngredientText}>{t("addRecipe.actions.addIngredient")}</Text>
                </Pressable>

                {/* Acciones */}
                <PrimaryButton
                    text={saving ? t("common.saving") : t("addRecipe.actions.save")}
                    onPress={handleSave}
                    disabled={saving}
                />

                <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
                </Pressable>
            </ScrollView>

            {generatingAi && (
                <View style={styles.aiOverlay}>
                    <View style={styles.aiOverlayCard}>
                        <ActivityIndicator size="large" color={THEME.primary} />
                        <Text style={styles.aiOverlayText}>{t("addRecipe.ai.generating")}</Text>
                    </View>
                </View>
            )}

            <GenerateAiFiltersModal
                visible={showAiModal}
                householdId={householdId}
                onGenerate={(params) => { setShowAiModal(false); handleGenerateAi(params); }}
                onClose={() => setShowAiModal(false)}
            />

            <LinkProductModal
                visible={linkModal.open}
                householdId={householdId}
                onSelect={(p: LinkedProduct) => {
                    if (linkModal.index !== null) {
                        updateIngredient(linkModal.index, {
                            name: p.name,
                            unit: p.unit.toUpperCase() as RecipeIngredientUnit,
                            productId: p.id,
                        });
                    }
                    setLinkModal({ open: false, index: null });
                }}
                onClose={() => setLinkModal({ open: false, index: null })}
            />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: THEME.bg },

    header: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: THEME.bg,
    },

    headerTitle: {fontSize: 18, fontWeight: "800", color: THEME.text},
    headerSpacer: {width: 24, height: 24},
    content: {paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32},

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: THEME.text,
        marginTop: 20,
        marginBottom: 12,
    },

    field: { marginBottom: 14 },
    fieldHalf: { marginBottom: 14, width: "50%" },
    input: {
        height: 54,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "#F8FCFA",
        paddingHorizontal: 18,
        fontSize: 16,
        color: THEME.text,
    },
    inputMultiline: {
        height: undefined,
        minHeight: 80,
        paddingTop: 14,
        paddingBottom: 14,
        borderRadius: 18,
        textAlignVertical: "top",
    },
    row: { flexDirection: "row", gap: 10, marginBottom: 14 },
    rowHalf: { flex: 1 },

    ingredientCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    ingredientHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    ingredientIndex: { fontSize: 13, fontWeight: "700", color: THEME.muted },
    ingredientQtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    ingredientQtyInput: { flex: 1, height: 44 },
    unitRow: { flexDirection: "row", gap: 4 },
    unitBtn: {
        paddingHorizontal: 10,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F5F7",
    },
    unitBtnActive: { borderColor: THEME.primary, backgroundColor: THEME.mint },
    unitBtnText: { fontSize: 12, fontWeight: "600", color: THEME.muted },
    unitBtnTextActive: { color: THEME.text },
    optionalRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    optionalLabel: { fontSize: 13, color: THEME.muted },
    addIngredientBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: THEME.mint2,
        marginBottom: 24,
    },
    addIngredientText: { fontSize: 13, fontWeight: "700", color: THEME.primary },

    linkProductBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "#F8FCFA",
    },
    linkProductText: { fontSize: 12, color: THEME.muted, fontWeight: "500" },
    linkProductTextLinked: { color: THEME.primary, fontWeight: "600" },

    cancelBtn: { marginTop: 14, alignSelf: "center" },
    cancelBtnText: { fontSize: 16, fontWeight: "600", color: "#5E7388" },

    aiBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: THEME.mint2,
    },
    aiBtnDisabled: { backgroundColor: "#F0F0F0" },
    aiBtnText: { fontSize: 12, fontWeight: "700", color: THEME.primary },
    aiBtnTextDisabled: { color: THEME.muted },

    aiOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(14, 26, 19, 0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99,
    },
    aiOverlayCard: {
        backgroundColor: THEME.surface,
        borderRadius: 20,
        paddingHorizontal: 36,
        paddingVertical: 28,
        alignItems: "center",
        gap: 14,
        shadowColor: THEME.shadow,
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    aiOverlayText: { fontSize: 15, fontWeight: "600", color: THEME.text },
});
