import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { DropdownField } from "./AddProductShared";
import { findProducts, type ProductFilters, type ProductItemStorageLocation, type ProductNutriScoreGrade, type ProductWithItems, type ProductUnit } from "../../api/products/productService";
import { resolveProductImage } from "../../utils/image";

type StorageFilter = "ALL" | "PANTRY" | "FRIDGE" | "FREEZER";
type NovaFilter = "ANY" | "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";
type Props = NativeStackScreenProps<AuthStackParamList, "MyProducts">;

function formatDate(date: string | null | undefined, emptyText: string) {
  if (!date) return emptyText;
  return date.slice(0, 10);
}

function formatQuantity(quantity?: string | null, unit?: ProductUnit) {
  if (!quantity || !unit) return "";
  return `${quantity}${unit === "UNIT" ? "" : unit.toLowerCase()}`;
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
}: {
  product: ProductWithItems;
  t: (key: string, options?: any) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  const firstLocation = product.items[0]?.storageLocation;
  const allSameLocation = product.items.every((item) => item.storageLocation === firstLocation);
  const locationMeta = allSameLocation && firstLocation ? getLocationMeta(firstLocation, t) : null;
  const subtitle = formatQuantity(product.quantity, product.unit);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)} style={styles.cardPressable}>
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            {locationMeta ? (
              <View style={[styles.badge, { backgroundColor: locationMeta.bg }]}>
                <MaterialCommunityIcons name={locationMeta.icon} size={15} color={locationMeta.color} />
                <Text style={[styles.badgeText, { color: locationMeta.color }]}>{locationMeta.label}</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.mixedBadge]}>
                <MaterialCommunityIcons name="layers-triple-outline" size={15} color={THEME.muted} />
                <Text style={[styles.badgeText, { color: THEME.muted }]}>
                  {t("products.list.mixedLocations")}
                </Text>
              </View>
            )}

            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{product.countItems}</Text>
            </View>
          </View>

          <View style={styles.mainRow}>
            <View style={styles.textBlock}>
              <Text style={styles.productName}>{product.name}</Text>
              {subtitle ? <Text style={styles.productSubtitle}>{subtitle}</Text> : null}

              <View style={styles.expandHintRow}>
                <Text style={styles.expandHintText}>
                  {expanded ? t("products.list.hideItems") : t("products.list.showItems")}
                </Text>
                <MaterialCommunityIcons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={THEME.muted}
                />
              </View>
            </View>

            <Image source={{ uri: resolveProductImage(product.image) }} style={styles.productImage} />
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.itemsContainer}>
          {product.items.map((item, index) => {
            const meta = getLocationMeta(item.storageLocation, t);

            return (
              <View
                key={item.id}
                style={[styles.itemRow, index !== product.items.length - 1 ? styles.itemRowBorder : null]}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIconWrap, { backgroundColor: meta.bg }]}>
                    <MaterialCommunityIcons name={meta.icon} size={15} color={meta.color} />
                  </View>

                  <View style={styles.itemTextBlock}>
                    <Text style={styles.itemTitle}>{t("products.list.itemNumber", { id: item.id })}</Text>
                    <Text style={styles.itemMeta}>
                      {t("products.list.purchaseDate")}: {formatDate(item.purchaseDate, t("products.list.noDate"))}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {t("products.list.expirationDate")}: {formatDate(item.expirationDate, t("products.list.noDate"))}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemLocation, { color: meta.color }]}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
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

  useEffect(() => {
    loadProducts(0, false);
  }, [currentHouseholdId, filters]);

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
          <Pressable onPress={() => setShowFilters((prev) => !prev)} style={styles.filterBtn}>
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
            renderItem={({ item }) => <ProductCard product={item} t={t} />}
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
                <Text style={styles.emptyText}>{t("products.list.empty")}</Text>
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
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  itemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: THEME.muted,
  },
  itemLocation: {
    fontSize: 13,
    fontWeight: "800",
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
