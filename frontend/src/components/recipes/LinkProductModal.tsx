import { useState } from "react";
import { useTranslation } from "react-i18next";
import { searchProductsByName } from "../../api/products/productService";
import { Modal, Pressable, StyleSheet, View, Text, TextInput, ScrollView } from "react-native";
import { THEME } from "../../theme/theme";

export type LinkedProduct = {
    id: number;
    name: string;
    unit: string;
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
            (block) => setProducts(block.items.map((p) => ({ id: p.id, name: p.name, unit: p.unit }))),
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
                    {products.map((p) => (
                        <Pressable key={p.id} style={styles.resultItem} onPress={() => handleSelect(p)}>
                            <Text style={styles.resultName}>{p.name}</Text>
                            <Text style={styles.resultUnit}>{p.unit.toLowerCase()}</Text>
                        </Pressable>
                    ))}
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
    resultName: {
        fontSize: 15,
        fontWeight: "600",
        color: THEME.text,
        flexShrink: 1,
    },
    resultUnit: {
        fontSize: 13,
        color: THEME.muted,
        marginLeft: 8,
    },
    emptyText: {
        fontSize: 14,
        color: THEME.muted,
        paddingVertical: 14,
        textAlign: "center",
    },
});