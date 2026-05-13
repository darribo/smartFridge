import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import { useHouseholdStore } from "../../store/householdStore";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { FallbackImage } from "../../components/common/FallbackImage";
import { addItemToList } from "../../api/shoppingList/shoppingListService";
import { searchProductsByName, type Product } from "../../api/products/productService";
import type { ApiError } from "../../api/appFetch";

type Props = Readonly<NativeStackScreenProps<AuthStackParamList, "AddShoppingItem">>;

function ResultSeparator() {
  return <View style={styles.separator} />;
}

export default function AddShoppingItemScreen({ route, navigation }: Props) {
  const { listId } = route.params;
  const { t } = useTranslation();
  const householdId = useHouseholdStore((s) => s.currentHouseholdId);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const [customName, setCustomName] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extractErrors = useCallback((err: ApiError): string[] => {
    if (Array.isArray(err.globalErrors) && err.globalErrors.length > 0) {
      return err.globalErrors;
    }
    if (err.fieldErrors) {
      const msgs = Object.values(err.fieldErrors)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .filter((m): m is string => Boolean(m));
      if (msgs.length > 0) return msgs;
    }
    return [t("common.networkError")];
  }, [t]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setErrors([]);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim() || !householdId) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      setSearching(true);
      searchProductsByName(
        householdId,
        text.trim(),
        0,
        (block) => {
          setSearchResults(block.items);
          setSearching(false);
        },
        () => {
          setSearchResults([]);
          setSearching(false);
        }
      );
    }, 300);
  };

  const handleAddProduct = (product: Product) => {
    if (addingProductId !== null) return;
    setErrors([]);
    setAddingProductId(product.id);
    addItemToList(
      listId,
      { productId: product.id },
      () => { navigation.goBack(); },
      (err) => {
        setAddingProductId(null);
        if (err.status === 409) setErrors([t("shoppingList.duplicateItem")]);
        else setErrors(extractErrors(err));
      }
    );
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    setErrors([]);
    setAddingCustom(true);
    addItemToList(
      listId,
      { customProductName: customName.trim() },
      () => { setAddingCustom(false); navigation.goBack(); },
      (err) => { setAddingCustom(false); setErrors(extractErrors(err)); }
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("addShoppingItem.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {errors.length > 0 && (
          <View style={styles.errorsWrap}>
            <GlobalErrorBox messages={errors} />
          </View>
        )}

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={THEME.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t("addShoppingItem.searchPlaceholder")}
              placeholderTextColor={THEME.muted}
              value={query}
              onChangeText={handleQueryChange}
              returnKeyType="search"
              autoFocus
            />
            {searching && <ActivityIndicator size="small" color={THEME.primary} />}
            {query.length > 0 && !searching && (
              <Pressable
                hitSlop={8}
                onPress={() => { setQuery(""); setSearchResults([]); }}
              >
                <MaterialCommunityIcons name="close" size={18} color={THEME.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            ItemSeparatorComponent={ResultSeparator}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.resultRow,
                  pressed && addingProductId === null && styles.resultPressed,
                  addingProductId !== null && addingProductId !== item.id && styles.resultDimmed,
                ]}
                onPress={() => handleAddProduct(item)}
                disabled={addingProductId !== null}
              >
                <FallbackImage
                  image={item.image}
                  iconName="package-variant"
                  iconSize={18}
                  style={styles.resultImage}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  {item.brand ? (
                    <Text style={styles.resultBrand} numberOfLines={1}>{item.brand}</Text>
                  ) : null}
                </View>
                {addingProductId === item.id
                  ? <ActivityIndicator size="small" color={THEME.primary} />
                  : <MaterialCommunityIcons name="plus" size={18} color={THEME.primary} />}
              </Pressable>
            )}
          />
        ) : (
          <View style={styles.form}>
            <View style={styles.separator2} />
            <Text style={styles.orLabel}>{t("addShoppingItem.orSeparator")}</Text>
            <Text style={styles.sectionLabel}>{t("addShoppingItem.customSection")}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder={t("addShoppingItem.customNamePlaceholder")}
                placeholderTextColor={THEME.muted}
                value={customName}
                onChangeText={(text) => { setCustomName(text); setErrors([]); }}
              />
            </View>
          </View>
        )}

        {searchResults.length === 0 && (
          <View style={styles.bottomBar}>
            <Pressable
              style={[styles.addBtn, (!customName.trim() || addingCustom) && styles.btnDisabled]}
              onPress={handleAddCustom}
              disabled={!customName.trim() || addingCustom}
            >
              {addingCustom
                ? <ActivityIndicator size="small" color="#0B2817" />
                : <MaterialCommunityIcons name="plus" size={20} color="#0B2817" />}
              <Text style={styles.addBtnText}>{t("addShoppingItem.addButton")}</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  errorsWrap: {
    paddingHorizontal: 18,
  },
  searchSection: {
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.mint2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
    maxWidth: 260,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 18,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  resultPressed: {
    opacity: 0.7,
  },
  resultDimmed: {
    opacity: 0.4,
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
  },
  resultBrand: {
    fontSize: 13,
    color: THEME.muted,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
  },
  form: {
    flex: 1,
    paddingHorizontal: 18,
    gap: 12,
  },
  separator2: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 4,
  },
  orLabel: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
  },
  inputWrap: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: THEME.text,
  },
  bottomBar: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  addBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B2817",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
