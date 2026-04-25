import { useState } from "react";
import { useTranslation } from "react-i18next";
import { searchProductsByName } from "../../api/products/productService";
import { Modal, Pressable, StyleSheet, View, Text, TextInput, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "../../theme/theme";

export type LinkedProduct = {
    id: number;
    name: string;
    unit: string;
    isVegetarian: boolean;
    isVegan: boolean;
    hasActiveItems?: boolean | null;
}

type Props = {
    visible: boolean;
    householdId: number;
    onSelect: (product: LinkedProduct) => void;
    onClose: () => void;
}

export default function LinkProductModal({ visible, householdId, onSelect, onClose }: Props) {

    const { t } = useTranslation();
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [search, setSearch] = useState("");


    const handleSearch = async (query: string) => {
        setSearch(query);
        if (!query.trim()) {setProducts([]); return; }

        await searchProductsByName(
            householdId,
            query,
            0,
            (block) => setProducts(block.items.map((p) => ({ id: p.id, name: p.name, unit: p.unit, isVegetarian: p.isVegetarian, isVegan: p.isVegan, hasActiveItems: p.hasActiveItems }))),
            () => setProducts([])
        );
    };

    const handleClose = () => {
        setSearch("");
        setProducts([]);
        onClose();
    };

    const handleSelect = (product: LinkedProduct) => {
        setSearch("");
        setProducts([]);
        onSelect(product);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable style={styles.backdrop} onPress={handleClose} />
            <View style={styles.sheet}>
                <View style={styles.handle} />
                <Text style={styles.title}>{t("addRecipe.ingredient.linkTitle")}</Text>

                <TextInput
                    style={styles.input}
                    value={search}
                    onChangeText={handleSearch}
                    placeholder={t("addRecipe.ingredient.searchPlaceholder")}
                    placeholderTextColor={THEME.muted}
                    autoFocus
                />
            
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
                    {products.length === 0 && search.trim().length > 0 && (
                        <Text style={styles.emptyText}>{t("addRecipe.ingredient.noResults")}</Text>
                    )}
                    {products.map((p) => {
                        const noStock = p.hasActiveItems === false;
                        return (
                            <Pressable key={p.id} style={styles.resultItem} onPress={() => handleSelect(p)}>
                                <View style={styles.resultLeft}>
                                    <Text style={[styles.resultName, noStock && styles.resultNameNoStock]}>{p.name}</Text>
                                    {noStock && (
                                        <View style={styles.noStockBadge}>
                                            <MaterialCommunityIcons name="package-variant-remove" size={11} color="#9CA3AF" />
                                            <Text style={styles.noStockText}>{t("addRecipe.ingredient.noStock")}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.resultUnit, noStock && styles.resultUnitNoStock]}>{p.unit.toLowerCase()}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 18,
        gap: 12,
        maxHeight: "70%",
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 4,
        backgroundColor: "#D5DCE2",
        alignSelf: "center",
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: "800",
        color: THEME.text,
    },
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
    results: {
        flexGrow: 0,
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    resultLeft: {
        flex: 1,
        flexShrink: 1,
        gap: 4,
    },
    resultName: {
        fontSize: 15,
        fontWeight: "600",
        color: THEME.text,
    },
    resultNameNoStock: {
        color: THEME.muted,
    },
    resultUnit: {
        fontSize: 13,
        color: THEME.muted,
        marginLeft: 8,
    },
    resultUnitNoStock: {
        color: THEME.border,
    },
    noStockBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    noStockText: {
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "600",
    },
    emptyText: {
        fontSize: 14,
        color: THEME.muted,
        paddingVertical: 14,
        textAlign: "center",
    },
});