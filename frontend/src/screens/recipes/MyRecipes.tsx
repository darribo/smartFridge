import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { findRecipes, type RecipeFilters, type RecipeSummary } from "../../api/recipes/recipeService";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { resolveImage } from "../../utils/image";
import { THEME } from "../../theme/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "MyRecipes">;

export default function MyRecipesScreen({ navigation }: Props) {

    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [loadingFirst, setLoadingFirst] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<RecipeFilters>({});

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
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Recipes</Text>
                <Pressable onPress={() => navigation.navigate("AddRecipe")}>
                    <Text style={styles.addButton}>+</Text>
                </Pressable>
            </View>

            {loadingFirst ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={THEME.primary} />
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ paddingVertical: 8 }}
                    onEndReached={() => {
                        if (hasMore && !loadingMore) loadRecipes(filters, page + 1, false);
                    }}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator color={THEME.primary} style={{ marginVertical: 12 }} /> : null}
                    ListEmptyComponent={<Text style={styles.empty}>No tienes recetas todavía</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image
                                source={{ uri: resolveImage(false, item.image) }}
                                style={styles.cardImage}
                            />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <View style={styles.cardMetaRow}>
                                    {item.totalMinutes && (
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>{item.totalMinutes} min</Text>
                                        </View>
                                    )}
                                    {item.difficulty && (
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>{item.difficulty}</Text>
                                        </View>
                                    )}
                                    {item.mealType && (
                                        <View style={styles.pill}>
                                            <Text style={styles.pillText}>{item.mealType}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: THEME.text },
    addButton: { fontSize: 28, fontWeight: "bold", color: THEME.primary },
    empty: { textAlign: "center", marginTop: 60, color: THEME.muted, fontSize: 15 },
    card: { flexDirection: "row", padding: 14, marginHorizontal: 16, marginVertical: 6, borderRadius: 12, backgroundColor: THEME.surface, shadowColor: THEME.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
    cardImage: { width: 76, height: 76, borderRadius: 10, backgroundColor: THEME.mint },
    cardInfo: { flex: 1, marginLeft: 12, justifyContent: "center", gap: 4 },
    cardTitle: { fontSize: 15, fontWeight: "600", color: THEME.text },
    cardMeta: { fontSize: 12, color: THEME.muted },
    cardMetaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    pill: { backgroundColor: THEME.mint, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    pillText: { fontSize: 11, color: THEME.primary, fontWeight: "500" },
});
