import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "../../theme/theme";
import { FallbackImage } from "../../components/common/FallbackImage";
import type { RecipeSummary } from "../../api/recipes/recipeService";

export function RecipeCard({ item, onPress }: Readonly<{ item: RecipeSummary; onPress?: () => void }>) {
    return (
        <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
            <FallbackImage
                image={item.image}
                style={styles.cardImage}
                iconName="silverware-fork-knife"
                iconSize={36}
            />
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.pillRow}>
                    {item.totalMinutes != null && (
                        <View style={styles.pill}>
                            <MaterialCommunityIcons name="clock-outline" size={12} color={THEME.primary} />
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
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: THEME.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: "hidden",
        padding: 14,
        alignItems: "center",
        gap: 14,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: THEME.mint2,
    },
    cardInfo: {
        flex: 1,
        gap: 8,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: THEME.text,
        lineHeight: 21,
    },
    pillRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: THEME.mint,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "700",
        color: THEME.primary,
    },
    cardPressed: {
        opacity: 0.75,
    },
});
