import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import { useHouseholdStore } from "../../store/householdStore";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import ShoppingListItemComponent from "../../components/shoppingList/ShoppingListItemComponent";
import {
  createShoppingList,
  deleteShoppingList,
  finalizeShoppingList,
  getActiveShoppingList,
  removeItemFromList,
  toggleItemChecked,
  updateItemCount,
  type FinalizeShoppingListResult,
  type ShoppingList,
  type ShoppingListItem,
} from "../../api/shoppingList/shoppingListService";
import type { BarcodeProduct } from "../../api/products/productService";
import type { ApiError } from "../../api/appFetch";

type Props = Readonly<NativeStackScreenProps<AuthStackParamList, "ShoppingList">>;

function ItemSeparator() {
  return <View style={{ height: 10 }} />;
}

function withItemReplaced(prev: ShoppingList | null, itemId: number, updated: ShoppingListItem): ShoppingList | null {
  if (!prev) return prev;
  return { ...prev, items: prev.items.map((i) => (i.id === itemId ? updated : i)) };
}

function withItemRemoved(prev: ShoppingList | null, itemId: number): ShoppingList | null {
  if (!prev) return prev;
  return { ...prev, items: prev.items.filter((i) => i.id !== itemId) };
}

export default function ShoppingListScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const householdId = useHouseholdStore((s) => s.currentHouseholdId);

  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const togglingItemIds = useRef<Set<number>>(new Set());
  const pendingFinalizeItems = useRef<Array<{ householdId: number; barcodeProduct: BarcodeProduct; initialItemCount?: number }>>([]);
  const inFinalizeFlow = useRef(false);
  const doFinalizeNavigationRef = useRef(() => {});

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

  doFinalizeNavigationRef.current = () => {
    if (pendingFinalizeItems.current.length === 0) {
      inFinalizeFlow.current = false;
      navigation.navigate("Home");
      return;
    }
    const next = pendingFinalizeItems.current.shift()!;
    if (next.barcodeProduct.id === null) {
      Alert.alert(
        t("shoppingList.registerProductTitle"),
        t("shoppingList.registerProductMessage", { name: next.barcodeProduct.name ?? "" }),
        [
          { text: t("shoppingList.skip"), style: "cancel", onPress: () => doFinalizeNavigationRef.current() },
          { text: t("shoppingList.registerProduct"), onPress: () => navigation.navigate("AddProduct", next) },
        ]
      );
      return;
    }
    navigation.navigate("AddProduct", next);
  };

  const loadList = useCallback(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrors([]);
    getActiveShoppingList(
      householdId,
      (activeList) => {
        setList(activeList);
        setLoading(false);
      },
      (err) => {
        if (err.status === 404) {
          setList(null);
        } else {
          setErrors(extractErrors(err));
        }
        setLoading(false);
      }
    );
  }, [householdId, extractErrors]);

  useFocusEffect(
    useCallback(() => {
      if (inFinalizeFlow.current) {
        doFinalizeNavigationRef.current();
        return;
      }
      loadList();
    }, [loadList])
  );

  const handleCreate = () => {
    if (!householdId) return;
    setActionLoading(true);
    setErrors([]);
    createShoppingList(
      householdId,
      (newList) => {
        setList(newList);
        setActionLoading(false);
      },
      (err) => {
        setErrors(extractErrors(err));
        setActionLoading(false);
      }
    );
  };

  const handleToggle = (itemId: number) => {
    if (!list || togglingItemIds.current.has(itemId)) return;
    togglingItemIds.current.add(itemId);
    toggleItemChecked(
      list.id,
      itemId,
      (updatedItem) => {
        togglingItemIds.current.delete(itemId);
        setList((prev) => withItemReplaced(prev, itemId, updatedItem));
      },
      () => {
        togglingItemIds.current.delete(itemId);
      }
    );
  };

  const handleUpdateCount = (itemId: number, newCount: number) => {
    if (!list) return;
    setList((prev) => withItemReplaced(prev, itemId,
      { ...prev!.items.find((i) => i.id === itemId)!, itemCount: newCount }
    ));
    updateItemCount(list.id, itemId, newCount, (updated) => {
      setList((prev) => withItemReplaced(prev, itemId, updated));
    });
  };

  const handleRemove = (itemId: number) => {
    if (!list) return;
    removeItemFromList(
      list.id,
      itemId,
      () => {
        setList((prev) => withItemRemoved(prev, itemId));
      },
      (err) => setErrors(extractErrors(err))
    );
  };

  const performDelete = (listId: number) => {
    setActionLoading(true);
    deleteShoppingList(
      listId,
      () => {
        setList(null);
        setActionLoading(false);
      },
      (err) => {
        setErrors(extractErrors(err));
        setActionLoading(false);
      }
    );
  };

  const handleDelete = () => {
    if (!list) return;
    const { id } = list;
    Alert.alert(
      t("shoppingList.deleteListConfirmTitle"),
      t("shoppingList.deleteListConfirmMessage"),
      [
        { text: t("shoppingList.cancel"), style: "cancel" },
        { text: t("shoppingList.deleteListConfirm"), style: "destructive", onPress: () => performDelete(id) },
      ]
    );
  };

  const buildFinalizeQueue = (result: FinalizeShoppingListResult): Array<{ householdId: number; barcodeProduct: BarcodeProduct }> => {
    if (!householdId) return [];
    const hid = householdId;
    return [
      ...result.checkedKnownItems.map((item) => ({
        householdId: hid,
        barcodeProduct: {
          id: item.productId ?? null,
          barcode: "",
          name: item.productName ?? "",
          image: item.productImage ?? null,
        } as BarcodeProduct,
        initialItemCount: item.itemCount ?? undefined,
      })),
      ...result.checkedCustomItems.map((item) => ({
        householdId: hid,
        barcodeProduct: {
          id: null,
          barcode: "",
          name: item.customProductName ?? "",
          brand: item.customProductBrand ?? null,
        } as BarcodeProduct,
        initialItemCount: item.itemCount ?? undefined,
      })),
    ];
  };

  const doFinalize = () => {
    if (!list) return;
    setActionLoading(true);
    finalizeShoppingList(
      list.id,
      (result) => {
        setActionLoading(false);
        setList(null);
        const queue = buildFinalizeQueue(result);
        if (queue.length === 0) {
          navigation.navigate("Home");
          return;
        }
        pendingFinalizeItems.current = queue;
        inFinalizeFlow.current = true;
        doFinalizeNavigationRef.current();
      },
      (err) => {
        setActionLoading(false);
        setErrors(extractErrors(err));
      }
    );
  };

  const handleFinalize = () => {
    if (!list) return;
    const uncheckedCount = list.items.filter((i) => !i.checked).length;
    if (uncheckedCount > 0) {
      Alert.alert(
        t("shoppingList.finalizeConfirmTitle"),
        t("shoppingList.finalizeConfirmMessage", { count: uncheckedCount }),
        [
          { text: t("shoppingList.cancel"), style: "cancel" },
          { text: t("shoppingList.finalizeAnyway"), onPress: doFinalize },
        ]
      );
      return;
    }
    doFinalize();
  };

  const checkedCount = list?.items.filter((i) => i.checked).length ?? 0;
  const totalCount = list?.items.length ?? 0;

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("shoppingList.title")}</Text>
        {list ? (
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteListBtn}>
            <MaterialCommunityIcons name="delete-outline" size={22} color="#B91C1C" />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {errors.length > 0 && (
        <View style={styles.errorsWrap}>
          <GlobalErrorBox messages={errors} />
        </View>
      )}

      {list ? (
        <>
          <View style={styles.countBar}>
            <Text style={styles.countText}>
              {t("shoppingList.itemCount", { checked: checkedCount, total: totalCount })}
            </Text>
          </View>

          <FlatList
            data={list.items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ShoppingListItemComponent
                item={item}
                onToggle={handleToggle}
                onRemove={handleRemove}
                onUpdateCount={handleUpdateCount}
                disabled={actionLoading}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyItems}>
                <Text style={styles.emptyItemsText}>{t("shoppingList.addItem")}</Text>
              </View>
            }
            ItemSeparatorComponent={ItemSeparator}
          />

          <View style={styles.bottomBar}>
            <Pressable
              style={styles.ghostBtn}
              onPress={() => navigation.navigate("AddShoppingItem", { listId: list.id })}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="plus" size={20} color={THEME.text} />
              <Text style={styles.ghostBtnText}>{t("shoppingList.addItem")}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, (actionLoading || totalCount === 0) && styles.btnDisabled]}
              onPress={handleFinalize}
              disabled={actionLoading || totalCount === 0}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#0B2817" />
              ) : (
                <MaterialCommunityIcons name="cart-check" size={20} color="#0B2817" />
              )}
              <Text style={styles.primaryBtnText}>{t("shoppingList.finalize")}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cart-outline" size={64} color={THEME.muted} />
          <Text style={styles.emptyTitle}>{t("shoppingList.noActiveList")}</Text>
          <Pressable
            style={[styles.createBtn, actionLoading && styles.btnDisabled]}
            disabled={actionLoading}
            onPress={handleCreate}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#0B2817" />
            ) : (
              <MaterialCommunityIcons name="plus" size={20} color="#0B2817" />
            )}
            <Text style={styles.primaryBtnText}>{t("shoppingList.createList")}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  deleteListBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 36,
  },
  errorsWrap: {
    paddingHorizontal: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.muted,
    textAlign: "center",
  },
  countBar: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.muted,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyItems: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  emptyItemsText: {
    fontSize: 15,
    color: THEME.muted,
  },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  createBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 28,
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B2817",
  },
  ghostBtn: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.surface,
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
