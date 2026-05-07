import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import { cookRecipe, deleteRecipe, getRecipe, previewCookRecipe, uploadRecipeImage, type Recipe, type RecipeIngredientUnit } from "../../api/recipes/recipeService";
import { FallbackImage } from "../../components/common/FallbackImage";

type Props = NativeStackScreenProps<AuthStackParamList, "RecipeDetail">;

function formatUnit(unit: RecipeIngredientUnit | null | undefined): string {
    switch (unit) {
        case "G": return "g";
        case "KG": return "kg";
        case "ML": return "ml";
        case "L": return "l";
        case "UNIT": return "ud";
        default: return "";
    }
}

function parseInstructions(instructions: string): string[] {
    return instructions
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

function getMealTypeIcon(mealType: string | null | undefined): string {
    switch (mealType) {
        case "BREAKFAST": return "coffee-outline";
        case "LUNCH": return "silverware-fork-knife";
        case "DINNER": return "moon-waning-crescent";
        case "SNACK": return "food-apple-outline";
        case "DESSERT": return "cake-variant-outline";
        default: return "silverware-fork-knife";
    }
}

function getDifficultyColor(difficulty: string | null | undefined): string {
    switch (difficulty) {
        case "EASY": return "#16A34A";
        case "MEDIUM": return "#D97706";
        case "HARD": return "#DC2626";
        default: return THEME.muted;
    }
}

export default function RecipeDetailScreen({ navigation, route }: Props) {
    const { t } = useTranslation();
    const { recipeId } = route.params;

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [cooking, setCooking] = useState(false);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        getRecipe(
            recipeId,
            (data) => { setRecipe(data); setLoading(false); },
            () => setLoading(false)
        );
    }, [recipeId]));

    const handleEdit = () => {
        if (!recipe) return;
        navigation.navigate("AddRecipe", {
            recipeId: recipe.id,
            initialRecipe: {
                title: recipe.title,
                description: recipe.description,
                instructions: recipe.instructions,
                notes: recipe.notes,
                servings: recipe.servings,
                preparationMinutes: recipe.preparationMinutes,
                cookingMinutes: recipe.cookingMinutes,
                totalMinutes: recipe.totalMinutes,
                difficulty: recipe.difficulty,
                cuisineType: recipe.cuisineType,
                dietType: recipe.dietType,
                mealType: recipe.mealType,
                seasonType: recipe.seasonType,
                vegetarian: recipe.vegetarian,
                vegan: recipe.vegan,
                generationSource: recipe.generationSource,
                ingredients: recipe.ingredients.map((ing) => ({
                    name: ing.name,
                    quantityValue: ing.quantityValue,
                    unit: ing.unit,
                    notes: ing.notes,
                    optionalIngredient: ing.optionalIngredient,
                    displayOrder: ing.displayOrder,
                    productId: ing.productId,
                })),
            },
        });
    };

    const handleDelete = () => {
        Alert.alert(
            t("recipeDetail.deleteTitle"),
            t("recipeDetail.deleteMessage"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("recipeDetail.deleteConfirm"),
                    style: "destructive",
                    onPress: () => {
                        setDeleting(true);
                        deleteRecipe(
                            recipeId,
                            () => { setDeleting(false); navigation.goBack(); },
                            () => setDeleting(false)
                        );
                    },
                },
            ]
        );
    };

    const launchCamera = async () => {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("", t("addProduct.imagePicker.permissionMessage"));
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.[0]?.uri) return;
        uploadRecipeImage(recipe!.id, result.assets[0].uri, (updated) => {
            setRecipe(prev => prev ? { ...prev, image: updated.image } : prev);
        });
    };

    const handlePhotoHint = () => {
        Alert.alert("", t("recipeDetail.noPhotoHint"));
    };

    const handleChangePhoto = () => {
        Alert.alert(t("recipeDetail.changePhotoTitle"), "", [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("recipeDetail.capturePhoto"), onPress: launchCamera },
        ]);
    };

    const handleCook = () => {
        setCooking(true);
        previewCookRecipe(
            recipeId,
            (preview) => {
                if (preview.lines.length === 0) {
                    setCooking(false);
                    Alert.alert(t("recipeDetail.noLinkedProductsTitle"), t("recipeDetail.noLinkedProductsMessage"));
                    return;
                }

                const insufficientRequired = preview.lines.filter(l => !l.sufficient && !l.optional);
                const onCookSuccess = () => {
                    setCooking(false);
                    if (!recipe?.image) {
                        Alert.alert(
                            t("recipeDetail.cookSuccessTitle"),
                            t("recipeDetail.cookSuccessCapturePrompt"),
                            [
                                { text: t("recipeDetail.skipPhoto"), style: "cancel" },
                                { text: t("recipeDetail.capturePhoto"), onPress: launchCamera },
                            ]
                        );
                    } else {
                        Alert.alert(t("recipeDetail.cookSuccessTitle"), t("recipeDetail.cookSuccessMessage"));
                    }
                };

                if (insufficientRequired.length === 0) {
                    cookRecipe(
                        recipeId,
                        false,
                        onCookSuccess,
                        () => { setCooking(false); Alert.alert("", t("recipeDetail.cookError")); }
                    );
                } else {
                    const names = insufficientRequired
                        .map(l => {
                            const unit = formatUnit((l.unit ?? undefined) as RecipeIngredientUnit | undefined);
                            return `${l.ingredientName}: ${l.availableQuantity ?? 0}${unit} / ${l.requiredQuantity ?? "?"}${unit}`;
                        })
                        .join("\n");
                    Alert.alert(
                        t("recipeDetail.insufficientTitle"),
                        names,
                        [
                            { text: t("common.cancel"), style: "cancel", onPress: () => setCooking(false) },
                            {
                                text: t("recipeDetail.cookWithAvailable"),
                                onPress: () => cookRecipe(
                                    recipeId,
                                    true,
                                    onCookSuccess,
                                    () => { setCooking(false); Alert.alert("", t("recipeDetail.cookError")); }
                                ),
                            },
                        ]
                    );
                }
            },
            () => { setCooking(false); Alert.alert("", t("recipeDetail.cookError")); }
        );
    };

    const totalMinutes = recipe
        ? (recipe.preparationMinutes ?? 0) + (recipe.cookingMinutes ?? 0)
        : null;

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {recipe?.title ?? t("recipeDetail.title")}
                </Text>
                <View style={styles.headerActions}>
                    {recipe && (
                        <>
                            <Pressable onPress={handleEdit} style={styles.headerBtn} hitSlop={8}>
                                <MaterialCommunityIcons name="pencil-outline" size={22} color={THEME.text} />
                            </Pressable>
                            <Pressable onPress={handleDelete} style={styles.headerBtn} hitSlop={8}>
                                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#DC2626" />
                            </Pressable>
                        </>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={THEME.primary} />
                </View>
            ) : !recipe ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={48} color={THEME.muted} />
                    <Text style={styles.errorText}>{t("recipeDetail.loadError")}</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Pressable
                            onPress={recipe.image ? handleChangePhoto : handlePhotoHint}
                            style={styles.heroImageWrap}
                        >
                            <FallbackImage
                                image={recipe.image}
                                style={styles.heroImage}
                                iconName="silverware-fork-knife"
                                iconSize={44}
                                resizeMode="cover"
                            />
                            <View style={styles.heroImageOverlay}>
                                <MaterialCommunityIcons
                                    name={recipe.image ? "camera-outline" : "lock-outline"}
                                    size={18}
                                    color="white"
                                />
                            </View>
                        </Pressable>
                        <Text style={styles.heroTitle}>{recipe.title}</Text>
                        {recipe.description ? (
                            <Text style={styles.heroDescription}>{recipe.description}</Text>
                        ) : null}
                    </View>

                    {/* Info chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        {totalMinutes != null && totalMinutes > 0 && (
                            <View style={styles.chip}>
                                <MaterialCommunityIcons name="clock-outline" size={14} color={THEME.primary} />
                                <Text style={styles.chipText}>{totalMinutes} min</Text>
                            </View>
                        )}
                        {recipe.preparationMinutes != null && recipe.preparationMinutes > 0 && (
                            <View style={styles.chip}>
                                <MaterialCommunityIcons name="knife" size={14} color={THEME.primary} />
                                <Text style={styles.chipText}>{t("recipeDetail.prep")} {recipe.preparationMinutes} min</Text>
                            </View>
                        )}
                        {recipe.cookingMinutes != null && recipe.cookingMinutes > 0 && (
                            <View style={styles.chip}>
                                <MaterialCommunityIcons name="fire" size={14} color="#D97706" />
                                <Text style={[styles.chipText, { color: "#D97706" }]}>{t("recipeDetail.cook")} {recipe.cookingMinutes} min</Text>
                            </View>
                        )}
                        {recipe.servings != null && (
                            <View style={styles.chip}>
                                <MaterialCommunityIcons name="account-group-outline" size={14} color={THEME.primary} />
                                <Text style={styles.chipText}>{recipe.servings} {t("recipeDetail.servings")}</Text>
                            </View>
                        )}
                        {recipe.difficulty && (
                            <View style={[styles.chip, { borderColor: getDifficultyColor(recipe.difficulty) + "40", backgroundColor: getDifficultyColor(recipe.difficulty) + "12" }]}>
                                <MaterialCommunityIcons name="signal-cellular-outline" size={14} color={getDifficultyColor(recipe.difficulty)} />
                                <Text style={[styles.chipText, { color: getDifficultyColor(recipe.difficulty) }]}>
                                    {t(`addRecipe.difficulty.${recipe.difficulty}`)}
                                </Text>
                            </View>
                        )}
                        {recipe.mealType && (
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>{t(`addRecipe.mealType.${recipe.mealType}`)}</Text>
                            </View>
                        )}
                        {recipe.cuisineType && recipe.cuisineType !== "OTHER" && (
                            <View style={styles.chip}>
                                <MaterialCommunityIcons name="earth" size={14} color={THEME.primary} />
                                <Text style={styles.chipText}>{t(`addRecipe.cuisineType.${recipe.cuisineType}`)}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Dietary badges */}
                    {(recipe.vegan || recipe.vegetarian) && (
                        <View style={styles.dietRow}>
                            {recipe.vegan && (
                                <View style={styles.dietBadge}>
                                    <MaterialCommunityIcons name="sprout" size={14} color="#16A34A" />
                                    <Text style={styles.dietBadgeText}>{t("recipeDetail.vegan")}</Text>
                                </View>
                            )}
                            {!recipe.vegan && recipe.vegetarian && (
                                <View style={styles.dietBadge}>
                                    <MaterialCommunityIcons name="leaf" size={14} color="#16A34A" />
                                    <Text style={styles.dietBadgeText}>{t("recipeDetail.vegetarian")}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Ingredients */}
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="format-list-bulleted" size={20} color={THEME.primary} />
                                <Text style={styles.sectionTitle}>{t("recipeDetail.ingredients")}</Text>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countBadgeText}>{recipe.ingredients.length}</Text>
                                </View>
                            </View>
                            <View style={styles.card}>
                                {recipe.ingredients.map((ing, index) => (
                                    <View
                                        key={ing.id}
                                        style={[
                                            styles.ingredientRow,
                                            index < recipe.ingredients.length - 1 && styles.ingredientRowBorder,
                                        ]}
                                    >
                                        <View style={styles.ingredientIndex}>
                                            <Text style={styles.ingredientIndexText}>{index + 1}</Text>
                                        </View>
                                        <View style={styles.ingredientInfo}>
                                            <Text style={styles.ingredientName}>
                                                {ing.name}
                                                {ing.optionalIngredient && (
                                                    <Text style={styles.optionalTag}> · {t("recipeDetail.optional")}</Text>
                                                )}
                                            </Text>
                                            {ing.notes ? (
                                                <Text style={styles.ingredientNotes}>{ing.notes}</Text>
                                            ) : null}
                                        </View>
                                        {ing.quantityValue != null && (
                                            <View style={styles.quantityPill}>
                                                <Text style={styles.quantityText}>
                                                    {ing.quantityValue}{formatUnit(ing.unit ?? undefined)}
                                                </Text>
                                            </View>
                                        )}
                                        {ing.productId && (
                                            <MaterialCommunityIcons name="link-variant" size={14} color={THEME.primary} style={styles.linkIcon} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Instructions */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={THEME.primary} />
                            <Text style={styles.sectionTitle}>{t("recipeDetail.instructions")}</Text>
                        </View>
                        <View style={styles.stepsWrap}>
                            {parseInstructions(recipe.instructions).map((step, index) => (
                                <View key={index} style={styles.stepRow}>
                                    <View style={styles.stepCircle}>
                                        <Text style={styles.stepNumber}>{index + 1}</Text>
                                    </View>
                                    {index < parseInstructions(recipe.instructions).length - 1 && (
                                        <View style={styles.stepLine} />
                                    )}
                                    <View style={styles.stepCard}>
                                        <Text style={styles.stepText}>
                                            {step.replace(/^\d+\.\s*/, "")}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    {recipe.notes ? (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons name="note-text-outline" size={20} color={THEME.primary} />
                                <Text style={styles.sectionTitle}>{t("recipeDetail.notes")}</Text>
                            </View>
                            <View style={[styles.card, styles.notesCard]}>
                                <Text style={styles.notesText}>{recipe.notes}</Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Source badge */}
                    {recipe.generationSource === "LLM" && (
                        <View style={styles.sourceRow}>
                            <MaterialCommunityIcons name="creation" size={13} color={THEME.muted} />
                            <Text style={styles.sourceText}>{t("recipeDetail.generatedByAi")}</Text>
                        </View>
                    )}
                </ScrollView>
                <View style={styles.cookButtonContainer}>
                    <Pressable
                        onPress={handleCook}
                        disabled={cooking || deleting}
                        style={[styles.cookButton, (cooking || deleting) && styles.cookButtonDisabled]}
                    >
                        {cooking
                            ? <ActivityIndicator color="white" />
                            : <>
                                <MaterialCommunityIcons name="pot-steam-outline" size={20} color="white" />
                                <Text style={styles.cookButtonText}>{t("recipeDetail.cookButton")}</Text>
                              </>
                        }
                    </Pressable>
                </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: THEME.bg },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
        backgroundColor: THEME.bg,
        gap: 8,
    },
    backBtn: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "700",
        color: THEME.text,
        textAlign: "center",
    },
    headerSpacer: { width: 36 },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 4 },
    headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    errorText: { fontSize: 15, color: THEME.muted },

    content: { paddingBottom: 40 },

    /* Hero */
    hero: {
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        gap: 10,
    },
    heroImageWrap: {
        width: 160,
        height: 120,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: 4,
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroImageOverlay: {
        position: "absolute",
        bottom: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 10,
        padding: 4,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: THEME.text,
        textAlign: "center",
        lineHeight: 32,
    },
    heroDescription: {
        fontSize: 15,
        color: THEME.muted,
        textAlign: "center",
        lineHeight: 22,
        fontStyle: "italic",
    },

    /* Chips */
    chipsRow: {
        paddingHorizontal: 20,
        gap: 8,
        paddingBottom: 16,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: THEME.mint,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    chipText: {
        fontSize: 13,
        fontWeight: "700",
        color: THEME.primary,
    },

    /* Dietary */
    dietRow: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    dietBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#DCFCE7",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#86EFAC",
    },
    dietBadgeText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#16A34A",
    },

    /* Sections */
    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: THEME.text,
        flex: 1,
    },
    countBadge: {
        backgroundColor: THEME.mint2,
        borderRadius: 999,
        minWidth: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "800",
        color: THEME.primary,
    },

    /* Card */
    card: {
        backgroundColor: THEME.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: "hidden",
    },

    /* Ingredients */
    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        gap: 12,
    },
    ingredientRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    ingredientIndex: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: THEME.mint2,
        alignItems: "center",
        justifyContent: "center",
    },
    ingredientIndexText: {
        fontSize: 12,
        fontWeight: "800",
        color: THEME.primary,
    },
    ingredientInfo: { flex: 1, gap: 2 },
    ingredientName: {
        fontSize: 15,
        fontWeight: "600",
        color: THEME.text,
    },
    ingredientNotes: {
        fontSize: 12,
        color: THEME.muted,
    },
    optionalTag: {
        fontSize: 12,
        color: THEME.muted,
        fontWeight: "400",
    },
    quantityPill: {
        backgroundColor: THEME.mint,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    quantityText: {
        fontSize: 13,
        fontWeight: "700",
        color: THEME.primary,
    },
    linkIcon: { marginLeft: 2 },

    /* Steps */
    stepsWrap: { gap: 0 },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    stepCircleWrap: { alignItems: "center" },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: THEME.primary,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
        zIndex: 1,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    stepLine: {
        position: "absolute",
        left: 15,
        top: 34,
        width: 2,
        height: "100%",
        backgroundColor: THEME.border,
    },
    stepCard: {
        flex: 1,
        backgroundColor: THEME.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: 14,
        marginBottom: 10,
    },
    stepText: {
        fontSize: 15,
        color: THEME.text,
        lineHeight: 22,
    },

    /* Notes */
    notesCard: { padding: 16 },
    notesText: {
        fontSize: 15,
        color: THEME.muted,
        lineHeight: 22,
        fontStyle: "italic",
    },

    /* Cook button */
    cookButtonContainer: {
        padding: 16,
        backgroundColor: THEME.bg,
        borderTopWidth: 1,
        borderTopColor: THEME.border,
    },
    cookButton: {
        backgroundColor: THEME.primary,
        borderRadius: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    cookButtonDisabled: { opacity: 0.6 },
    cookButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    /* Source */
    sourceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sourceText: {
        fontSize: 12,
        color: THEME.muted,
    },
});
