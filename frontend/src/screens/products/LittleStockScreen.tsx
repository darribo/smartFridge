import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import NoHouseholdModal from "../../components/common/NoHouseholdModal";
import { getLittleStockProducts, type LittleStockProduct } from "../../api/products/productService";
import { FallbackImage } from "../../components/common/FallbackImage";

type Props = NativeStackScreenProps<AuthStackParamList, "LittleStockProducts">;

function getStockPercent(remaining?: string | null, initial?: string | null): number | null {
  const r = parseFloat(remaining ?? "");
  const i = parseFloat(initial ?? "");
  if (isNaN(r) || isNaN(i) || i === 0) return null;
  return Math.round((r / i) * 100);
}

function LittleStockCard({
  item,
  t,
  onPress,
}: {
  item: LittleStockProduct;
  t: (key: string, opts?: any) => string;
  onPress: () => void;
}) {
  const percent = getStockPercent(item.quantityRemainingValue, item.initialQuantityValue);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View style={[styles.badge, { backgroundColor: "#F0EBFC" }]}>
            <MaterialCommunityIcons name="trending-down" size={14} color="#7B54C9" />
            <Text style={[styles.badgeText, { color: "#7B54C9" }]}>
              {percent !== null
                ? t("products.littleStock.percentRemaining", { percent })
                : t("products.littleStock.badge")}
            </Text>
          </View>
        </View>
        <View style={styles.mainRow}>
          <View style={styles.textBlock}>
            <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
          </View>
          <FallbackImage image={item.productImage} style={styles.productImage} iconName="food-apple" iconSize={44} />
        </View>
      </View>
    </Pressable>
  );
}

export default function LittleStockScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);

  const [showNoHousehold, setShowNoHousehold] = useState(!currentHouseholdId);
  const [items, setItems] = useState<LittleStockProduct[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const requestIdRef = useRef(0);

  const loadItems = (targetPage: number, append: boolean) => {
    if (!currentHouseholdId) {
      setItems([]);
      setHasMore(false);
      setLoadingFirst(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingFirst(true);
      setGlobalErrors([]);
    }

    getLittleStockProducts(
      currentHouseholdId,
      targetPage,
      (block) => {
        if (requestId !== requestIdRef.current) return;
        setItems((prev) => (append ? [...prev, ...block.items] : block.items));
        setHasMore(block.existMoreItems);
        setPage(targetPage);
        setLoadingFirst(false);
        setLoadingMore(false);
      },
      (err) => {
        if (requestId !== requestIdRef.current) return;
        setGlobalErrors(err.globalErrors ?? [t("products.littleStock.errors.default")]);
        setLoadingFirst(false);
        setLoadingMore(false);
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadItems(0, false);
    }, [currentHouseholdId])
  );

  const onEndReached = () => {
    if (loadingFirst || loadingMore || !hasMore) return;
    loadItems(page + 1, true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <NoHouseholdModal
        visible={showNoHousehold}
        onClose={() => { setShowNoHousehold(false); navigation.goBack(); }}
        onCreateHousehold={() => { setShowNoHousehold(false); navigation.navigate("CreateHousehold"); }}
        onGoToHouseholds={() => { setShowNoHousehold(false); navigation.navigate("MyHouseholds"); }}
      />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>{t("products.littleStock.title")}</Text>
              <Text style={styles.subtitle}>{t("products.littleStock.subtitle")}</Text>
            </View>
          </View>
        </View>

        {globalErrors.length > 0 ? (
          <View style={styles.errorsWrap}>
            <GlobalErrorBox messages={globalErrors} />
          </View>
        ) : null}

        {loadingFirst ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item, index) => item.id != null ? String(item.id) : String(index)}
            renderItem={({ item }) => (
              <LittleStockCard
                item={item}
                t={t}
                onPress={() => navigation.navigate("ProductDetail", { productId: item.productId })}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={THEME.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>{t("products.littleStock.empty")}</Text>
              </View>
            }
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
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: THEME.muted,
  },
  errorsWrap: {
    marginHorizontal: 20,
    marginBottom: 12,
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
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardContent: {
    padding: 16,
    gap: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "900",
    color: THEME.text,
  },
  productImage: {
    width: 116,
    height: 116,
    borderRadius: 24,
    backgroundColor: THEME.mint2,
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
