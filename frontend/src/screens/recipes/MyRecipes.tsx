import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { findRecipes, type RecipeFilters, type RecipeSummary } from "../../api/recipes/recipeService";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { THEME } from "../../theme/theme";
import { RecipeCard } from "./RecipeCard";

type Props = NativeStackScreenProps<AuthStackParamList, "MyRecipes">;

export default function MyRecipesScreen({ navigation }: Props) {
    const { t } = useTranslation();

    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [loadingFirst, setLoadingFirst] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [filters] = useState<RecipeFilters>({});

    const loadRecipes = useCallback((currentFilters: RecipeFilters, currentPage: number, replace: boolean) => {
        if (currentPage === 0) setLoadingFirst(true);
        else setLoadingMore(true);

        findRecipes(currentFilters, currentPage,
            (block) => {
                setRecipes(prev => replace ? block.items : [...prev, ...block.items]);
                setHasMore(block.existMoreItems);
                setPage(currentPage);
                setLoadingFirst(false);
                setLoadingMore(false);
            },
            (err) => {
                console.error("Error loading recipes", err);
                setLoadingFirst(false);
                setLoadingMore(false);
            }
        );
    }, []);

    useFocusEffect(useCallback(() => {
        loadRecipes(filters, 0, true);
    }, []));

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.screen}>

                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
                            <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
                        </Pressable>
                        <Text style={styles.title}>{t("myRecipes.title")}</Text>
                    </View>
                    <Pressable
                        onPress={() => navigation.navigate("AddRecipe")}
                        style={styles.addBtn}
                    >
                        <MaterialCommunityIcons name="plus" size={22} color={THEME.surface} />
                    </Pressable>
                </View>

                {loadingFirst ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={THEME.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={recipes}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onEndReached={() => {
                            if (hasMore && !loadingMore) loadRecipes(filters, page + 1, false);
                        }}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            loadingMore
                                ? <View style={styles.footerLoading}><ActivityIndicator color={THEME.primary} /></View>
                                : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyText}>{t("myRecipes.empty")}</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <RecipeCard item={item} onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })} />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    screen: {
        flex: 1,
        backgroundColor: THEME.bg,
        paddingTop: 8,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backBtn: {
        width: 36,
        height: 36,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: THEME.text,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        gap: 16,
    },
    footerLoading: {
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyWrap: {
        paddingVertical: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 15,
        color: THEME.muted,
    },
});
