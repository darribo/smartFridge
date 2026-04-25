import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
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
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import { useHouseholdStore } from "../../store/householdStore";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import NoHouseholdModal from "../../components/common/NoHouseholdModal";
import { DropdownField } from "./AddProductShared";
import { findProducts, type ProductFilters, type ProductItem, type ProductItemStorageLocation, type ProductNutriScoreGrade, type ProductWithItems, type ProductUnit } from "../../api/products/productService";
import { resolveImage } from "../../utils/image";

type StorageFilter = "ALL" | "PANTRY" | "FRIDGE" | "FREEZER";
type NovaFilter = "ANY" | "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";
type Props = NativeStackScreenProps<AuthStackParamList, "MyProducts">;

function formatQuantity(quantity?: string | null, unit?: ProductUnit) {
  if (!quantity || !unit) return "";
  const num = parseFloat(quantity);
  if (isNaN(num)) return "";
  const formatted = String(num);
  if (unit === "UNIT") return formatted;
  return `${formatted} ${unit.toLowerCase()}`;
}

function getLocationMeta(location: ProductItemStorageLocation, t: (key: string) => string) {
  switch (location) {
    case "PANTRY":
      return {
        label: t("products.locationSelector.options.pantry"),
        icon: "package-variant-closed" as const,
        color: THEME.text,
        bg: THEME.mint,
      };
    case "FRIDGE":
      return {
        label: t("products.locationSelector.options.fridge"),
        icon: "fridge-outline" as const,
        color: THEME.primary,
        bg: THEME.mint2,
      };
    case "FREEZER":
      return {
        label: t("products.locationSelector.options.freezer"),
        icon: "snowflake" as const,
        color: THEME.muted,
        bg: THEME.mint,
      };
  }
}

function getSoonestExpiryBadge(
  items: ProductItem[],
  t: (key: string, options?: any) => string
): { text: string; color: string; bg: string } | null {
  let minDays: number | null = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of items) {
    if (!item.expirationDate) continue;
    const exp = new Date(item.expirationDate);
    exp.setHours(0, 0, 0, 0);
    const days = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (minDays === null || days < minDays) minDays = days;
  }

  if (minDays === null || minDays > 3) return null;
  if (minDays < 0) return { text: t("products.expiring.expired"), color: "#B91C1C", bg: "#FEE2E2" };
  if (minDays === 0) return { text: t("products.expiring.today"), color: "#C2670A", bg: "#FFF3E5" };
  if (minDays === 1) return { text: t("products.expiring.tomorrow"), color: "#C2670A", bg: "#FFF3E5" };
  return { text: t("products.expiring.inDays", { count: minDays }), color: "#B45309", bg: "#FEF3C7" };
}

function getFilterLabel(filter: StorageFilter, t: (key: string) => string) {
  switch (filter) {
    case "PANTRY":
      return t("products.locationSelector.options.pantry");
    case "FRIDGE":
      return t("products.locationSelector.options.fridge");
    case "FREEZER":
      return t("products.locationSelector.options.freezer");
    default:
      return t("products.locationSelector.options.all");
  }
}

function NullableToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  const active = value === true;

  return (
    <Pressable
      onPress={() => onChange(active ? null : true)}
      style={[styles.toggleChip, active && styles.toggleChipActive]}
    >
      <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ProductCard({
  product,
  t,
  onPress,
}: {
  product: ProductWithItems;
  t: (key: string, options?: any) => string;
  onPress: () => void;
}) {
  const empty = !product.hasActiveItems;
  const firstLocation = product.items[0]?.storageLocation;
  const allSameLocation = product.items.every((item) => item.storageLocation === firstLocation);
  const locationMeta = allSameLocation && firstLocation ? getLocationMeta(firstLocation, t) : null;
  const subtitle = formatQuantity(product.quantity, product.unit);
  const expiryBadge = getSoonestExpiryBadge(product.items, t);

  let locationBadge: React.ReactElement;
  if (empty) {
    locationBadge = (
      <View style={[styles.badge, styles.emptyStockBadge]}>
        <MaterialCommunityIcons name="package-variant-remove" size={15} color={THEME.muted} />
        <Text style={[styles.badgeText, { color: THEME.muted }]}>{t("products.list.outOfStock")}</Text>
      </View>
    );
  } else if (locationMeta) {
    locationBadge = (
      <View style={[styles.badge, { backgroundColor: locationMeta.bg }]}>
        <MaterialCommunityIcons name={locationMeta.icon} size={15} color={locationMeta.color} />
        <Text style={[styles.badgeText, { color: locationMeta.color }]}>{locationMeta.label}</Text>
      </View>
    );
  } else {
    locationBadge = (
      <View style={[styles.badge, styles.mixedBadge]}>
        <MaterialCommunityIcons name="layers-triple-outline" size={15} color={THEME.muted} />
        <Text style={[styles.badgeText, { color: THEME.muted }]}>{t("products.list.mixedLocations")}</Text>
      </View>
    );
  }

  return (
    <Pressable style={[styles.card, empty && styles.cardEmpty]} onPress={onPress}>
      <View style={[styles.cardContent, styles.cardPressable]}>
        <View style={styles.cardTopRow}>
          {locationBadge}

          <View style={[styles.countPill, empty && styles.countPillEmpty]}>
            <Text style={[styles.countPillText, empty && styles.countPillTextEmpty]}>{product.countItems}</Text>
          </View>
        </View>

        {expiryBadge && (
          <View style={[styles.badge, { alignSelf: "flex-start", backgroundColor: expiryBadge.bg }]}>
            <MaterialCommunityIcons name="clock-alert-outline" size={13} color={expiryBadge.color} />
            <Text style={[styles.badgeText, { color: expiryBadge.color }]}>{expiryBadge.text}</Text>
          </View>
        )}

        <View style={styles.mainRow}>
          <View style={styles.textBlock}>
            <Text style={[styles.productName, empty && styles.productNameEmpty]}>{product.name}</Text>
            {subtitle ? <Text style={styles.productSubtitle}>{subtitle}</Text> : null}

            <View style={styles.expandHintRow}>
              <Text style={styles.expandHintText}>{t("products.list.viewDetail")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={THEME.muted} />
            </View>
          </View>

          <Image source={{ uri: resolveImage(true, product.image) }} style={[styles.productImage, empty && styles.productImageEmpty]} />
        </View>
      </View>
    </Pressable>
  );
}

export default function ProductsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);
  const storageFilter: StorageFilter = route.params?.storageFilter ?? "ALL";

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [isVegetarian, setIsVegetarian] = useState<boolean | null>(null);
  const [isVegan, setIsVegan] = useState<boolean | null>(null);
  const [nutriScoreGrade, setNutriScoreGrade] = useState<ProductNutriScoreGrade | "ANY">("ANY");
  const [novaGroup, setNovaGroup] = useState<NovaFilter>("ANY");
  const [showFilters, setShowFilters] = useState(false);

  const [showNoHousehold, setShowNoHousehold] = useState(!currentHouseholdId);
  const [products, setProducts] = useState<ProductWithItems[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const requestIdRef = useRef(0);

  const nutriOptions: Array<{ label: string; value: ProductNutriScoreGrade | "ANY" }> = [
    { label: t("products.filters.any"), value: "ANY" },
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
    { label: "D", value: "D" },
    { label: "E", value: "E" },
  ];

  const novaOptions: Array<{ label: string; value: NovaFilter }> = [
    { label: t("products.filters.any"), value: "ANY" },
    { label: "1", value: "GROUP_1" },
    { label: "2", value: "GROUP_2" },
    { label: "3", value: "GROUP_3" },
    { label: "4", value: "GROUP_4" },
  ];

  const filters = useMemo<ProductFilters>(
    () => ({
      name: search.trim() || undefined,
      brand: brand.trim() || undefined,
      isVegetarian,
      isVegan,
      nutriScoreGrade: nutriScoreGrade === "ANY" ? null : nutriScoreGrade,
      novaGroup: novaGroup === "ANY" ? null : novaGroup,
      storageLocation: storageFilter === "ALL" ? null : storageFilter,
    }),
    [search, brand, isVegetarian, isVegan, nutriScoreGrade, novaGroup, storageFilter]
  );

  const loadProducts = (targetPage: number, append: boolean) => {
    if (!currentHouseholdId) {
      setProducts([]);
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

    findProducts(
      currentHouseholdId,
      filters,
      targetPage,
      (block) => {
        if (requestId !== requestIdRef.current) return;

        setProducts((prev) => (append ? [...prev, ...block.items] : block.items));
        setHasMore(block.existMoreItems);
        setPage(targetPage);
        setLoadingFirst(false);
        setLoadingMore(false);
      },
      (err) => {
        if (requestId !== requestIdRef.current) return;

        setGlobalErrors(err.globalErrors ?? [t("products.list.errors.default")]);
        setLoadingFirst(false);
        setLoadingMore(false);
      }
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts(0, false);
    }, [currentHouseholdId, filters])
  );

  const onEndReached = () => {
    if (loadingFirst || loadingMore || !hasMore) return;
    loadProducts(page + 1, true);
  };

  const onClearFilters = () => {
    setBrand("");
    setIsVegetarian(null);
    setIsVegan(null);
    setNutriScoreGrade("ANY");
    setNovaGroup("ANY");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <NoHouseholdModal
        visible={showNoHousehold}
        onClose={() => { setShowNoHousehold(false); navigation.goBack(); }}
        onCreateHousehold={() => { setShowNoHousehold(false); navigation.navigate("CreateHousehold"); }}
        onGoToHouseholds={() => { setShowNoHousehold(false); navigation.navigate("MyHouseholds"); }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>{t("products.list.title")}</Text>
              <Text style={styles.subtitle}>{getFilterLabel(storageFilter, t)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={22} color={THEME.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("products.list.searchPlaceholder")}
            placeholderTextColor={THEME.muted}
            style={styles.searchInput}
          />
          <Pressable onPress={() => { Keyboard.dismiss(); setShowFilters((prev) => !prev); }} style={styles.filterBtn}>
            <MaterialCommunityIcons
              name={showFilters ? "tune-variant" : "tune"}
              size={20}
              color={THEME.text}
            />
          </Pressable>
        </View>

        {showFilters ? (
          <View style={styles.filtersPanel}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>{t("products.filters.title")}</Text>
              <Pressable onPress={onClearFilters}>
                <Text style={styles.filtersReset}>{t("products.filters.clear")}</Text>
              </Pressable>
            </View>

            <View style={styles.filterInputWrap}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={THEME.muted} />
              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder={t("products.filters.brandPlaceholder")}
                placeholderTextColor={THEME.muted}
                style={styles.filterInput}
              />
            </View>

            <View style={styles.toggleRow}>
              <NullableToggle
                label={t("products.filters.vegetarian")}
                value={isVegetarian}
                onChange={setIsVegetarian}
              />
              <NullableToggle
                label={t("products.filters.vegan")}
                value={isVegan}
                onChange={setIsVegan}
              />
            </View>

            <View style={styles.dropdownRow}>
              <View style={styles.dropdownHalf}>
                <DropdownField
                  label={t("products.filters.nutriScore")}
                  options={nutriOptions}
                  value={nutriScoreGrade}
                  onChange={setNutriScoreGrade}
                />
              </View>
              <View style={styles.dropdownHalf}>
                <DropdownField
                  label={t("products.filters.novaGroup")}
                  options={novaOptions}
                  value={novaGroup}
                  onChange={setNovaGroup}
                />
              </View>
            </View>
          </View>
        ) : null}

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
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                t={t}
                onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="on-drag"
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
                <Text style={styles.emptyText}>{t("products.list.empty")}</Text>
              </View>
            }
          />
        )}
      </View>
      </KeyboardAvoidingView>
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
  searchBox: {
    marginHorizontal: 20,
    marginBottom: 14,
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.text,
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersPanel: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
  },
  filtersReset: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
  },
  filterInputWrap: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.mint,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    fontSize: 15,
    color: THEME.text,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  toggleChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  toggleChipActive: {
    backgroundColor: THEME.mint2,
    borderColor: "#BFE7CC",
  },
  toggleChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.muted,
  },
  toggleChipTextActive: {
    color: THEME.text,
  },
  dropdownRow: {
    flexDirection: "row",
    gap: 12,
  },
  dropdownHalf: {
    flex: 1,
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
  cardEmpty: {
    opacity: 0.55,
    borderStyle: "dashed",
  },
  emptyStockBadge: {
    backgroundColor: THEME.mint,
  },
  countPillEmpty: {
    backgroundColor: THEME.border,
  },
  countPillTextEmpty: {
    color: THEME.muted,
  },
  productNameEmpty: {
    color: THEME.muted,
  },
  productImageEmpty: {
    opacity: 0.4,
  },
  cardPressable: {
    padding: 16,
  },
  cardContent: {
    gap: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  mixedBadge: {
    backgroundColor: THEME.mint,
  },
  countPill: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countPillText: {
    fontSize: 13,
    fontWeight: "900",
    color: THEME.text,
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
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 18,
    color: THEME.muted,
    marginBottom: 14,
  },
  expandHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expandHintText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.muted,
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
