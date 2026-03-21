import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import { getProductDetail, type ProductDetail, type ProductItem, type ProductItemStorageLocation, type ProductUnit } from "../../api/products/productService";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { resolveProductImage } from "../../utils/image";
import { useHouseholdStore } from "../../store/householdStore";

type Props = NativeStackScreenProps<AuthStackParamList, "ProductDetail">;

function formatDate(date: string | null | undefined, emptyText: string) {
  if (!date) return emptyText;
  return date.slice(0, 10);
}

function formatQuantity(quantity?: string | null, unit?: ProductUnit | null) {
  if (!quantity) return null;
  const unitLabel = unit === "UNIT" ? "ud" : (unit?.toLowerCase() ?? "");
  return `${quantity} ${unitLabel}`.trim();
}

function getExpirationColor(expirationDate: string | null | undefined): string {
  if (!expirationDate) return THEME.muted;
  const diff = (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 3) return "#B91C1C";
  if (diff < 7) return "#D97706";
  return THEME.primary;
}

function getLocationMeta(location: ProductItemStorageLocation, t: (key: string) => string) {
  switch (location) {
    case "PANTRY":
      return { label: t("products.locationSelector.options.pantry"), icon: "package-variant-closed" as const, color: THEME.text, bg: THEME.mint };
    case "FRIDGE":
      return { label: t("products.locationSelector.options.fridge"), icon: "fridge-outline" as const, color: THEME.primary, bg: THEME.mint2 };
    case "FREEZER":
      return { label: t("products.locationSelector.options.freezer"), icon: "snowflake" as const, color: THEME.muted, bg: THEME.mint };
  }
}

function getNutriScoreColor(grade: string): string {
  switch (grade) {
    case "A": return "#038141";
    case "B": return "#85BB2F";
    case "C": return "#FECB00";
    case "D": return "#EE8100";
    case "E": return "#E63312";
    default: return THEME.muted;
  }
}

function getNovaColor(group: string): string {
  switch (group) {
    case "GROUP_1": return "#038141";
    case "GROUP_2": return "#85BB2F";
    case "GROUP_3": return "#EE8100";
    case "GROUP_4": return "#E63312";
    default: return THEME.muted;
  }
}

function getNovaNumber(group: string): string {
  return group.replace("GROUP_", "");
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon as any} size={18} color={THEME.muted} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ItemCard({ item, product, t }: { item: ProductItem; product: ProductDetail; t: (key: string, opts?: any) => string }) {
  const meta = getLocationMeta(item.storageLocation, t);
  const expColor = getExpirationColor(item.expirationDate);
  const noDate = t("products.list.noDate");
  const quantityLabel = product.unit === "UNIT" ? "ud" : (product.unit?.toLowerCase() ?? "");

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemCardHeader}>
        <View style={[styles.locationBadge, { backgroundColor: meta.bg }]}>
          <MaterialCommunityIcons name={meta.icon} size={15} color={meta.color} />
          <Text style={[styles.locationBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        {item.expirationDate ? (
          <Text style={[styles.expirationText, { color: expColor }]}>
            {t("products.detail.expires")} {formatDate(item.expirationDate, noDate)}
          </Text>
        ) : (
          <Text style={styles.expirationMuted}>{t("products.detail.noExpiration")}</Text>
        )}
      </View>

      <View style={styles.itemCardBody}>
        {item.purchaseDate ? (
          <View style={styles.itemDetailRow}>
            <MaterialCommunityIcons name="cart-outline" size={15} color={THEME.muted} />
            <Text style={styles.itemDetailText}>
              {t("products.list.purchaseDate")}: {formatDate(item.purchaseDate, noDate)}
            </Text>
          </View>
        ) : null}

        {item.pricePaid ? (
          <View style={styles.itemDetailRow}>
            <MaterialCommunityIcons name="tag-outline" size={15} color={THEME.muted} />
            <Text style={styles.itemDetailText}>
              {t("products.detail.pricePaid")}: {item.pricePaid} €
            </Text>
          </View>
        ) : null}

        {item.initialQuantityValue ? (
          <View style={styles.itemDetailRow}>
            <MaterialCommunityIcons name="scale-balance" size={15} color={THEME.muted} />
            <Text style={styles.itemDetailText}>
              {t("products.detail.quantity")}: {item.quantityRemainingValue ?? item.initialQuantityValue} / {item.initialQuantityValue} {quantityLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { productId } = route.params;
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setErrors([]);
      getProductDetail(
        productId,
        (data) => {
          setProduct(data);
          setLoading(false);
        },
        (err) => {
          setErrors(err.globalErrors ?? [t("products.detail.loadError")]);
          setLoading(false);
        }
      );
    }, [productId])
  );

  const quantityStr = product ? formatQuantity(product.quantity, product.unit) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {product?.name ?? t("products.detail.title")}
        </Text>
        <View style={styles.topBarRight} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : errors.length > 0 ? (
        <View style={styles.errorsWrap}>
          <GlobalErrorBox messages={errors} />
        </View>
      ) : product ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Hero image */}
          <Image source={{ uri: resolveProductImage(product.image) }} style={styles.heroImage} />

          {/* Product header */}
          <View style={styles.section}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
            {quantityStr ? (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityBadgeText}>{quantityStr}</Text>
              </View>
            ) : null}

            {/* Dietary badges */}
            <View style={styles.badgeRow}>
              {product.isVegetarian ? (
                <View style={[styles.dietBadge, styles.dietBadgeGreen]}>
                  <MaterialCommunityIcons name="leaf" size={14} color="#166534" />
                  <Text style={[styles.dietBadgeText, { color: "#166534" }]}>{t("products.detail.vegetarian")}</Text>
                </View>
              ) : null}
              {product.isVegan ? (
                <View style={[styles.dietBadge, styles.dietBadgeGreen]}>
                  <MaterialCommunityIcons name="sprout" size={14} color="#166534" />
                  <Text style={[styles.dietBadgeText, { color: "#166534" }]}>{t("products.detail.vegan")}</Text>
                </View>
              ) : null}
              {product.nutriScoreGrade ? (
                <View style={[styles.dietBadge, { backgroundColor: getNutriScoreColor(product.nutriScoreGrade) + "22" }]}>
                  <Text style={[styles.dietBadgeText, { color: getNutriScoreColor(product.nutriScoreGrade) }]}>
                    Nutri-Score {product.nutriScoreGrade}
                  </Text>
                </View>
              ) : null}
              {product.novaGroup ? (
                <View style={[styles.dietBadge, { backgroundColor: getNovaColor(product.novaGroup) + "22" }]}>
                  <Text style={[styles.dietBadgeText, { color: getNovaColor(product.novaGroup) }]}>
                    NOVA {getNovaNumber(product.novaGroup)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Info rows */}
          <View style={styles.infoCard}>
            {product.barcode ? (
              <InfoRow icon="barcode-scan" label={t("products.detail.barcode")} value={product.barcode} />
            ) : null}
            {product.defaultPrice ? (
              <InfoRow icon="currency-eur" label={t("products.detail.defaultPrice")} value={`${product.defaultPrice} €`} />
            ) : null}
            {product.daysAfterOpening != null ? (
              <InfoRow
                icon="timer-outline"
                label={t("products.detail.daysAfterOpening")}
                value={t("products.detail.daysAfterOpeningValue", { count: product.daysAfterOpening })}
              />
            ) : null}
            <InfoRow
              icon="calendar-outline"
              label={t("products.detail.addedOn")}
              value={formatDate(product.createdAt, "-")}
            />
          </View>

          {/* Items section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("products.detail.itemsTitle")}</Text>
            <Pressable
              onPress={() => {
                if (!currentHouseholdId) return;
                navigation.navigate("AddProduct", {
                  householdId: currentHouseholdId,
                  barcodeProduct: {
                    id: product.id,
                    barcode: product.barcode ?? "",
                    name: product.name,
                    image: product.image ?? null,
                    defaultPrice: product.defaultPrice ?? null,
                    quantity: product.quantity ?? null,
                    unit: product.unit ?? null,
                  },
                });
              }}
              style={styles.addItemBtn}
            >
              <MaterialCommunityIcons name="plus" size={18} color={THEME.primary} />
              <Text style={styles.addItemText}>{t("products.detail.addItem")}</Text>
            </Pressable>
          </View>

          {product.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <MaterialCommunityIcons name="package-variant" size={36} color={THEME.border} />
              <Text style={styles.emptyItemsText}>{t("products.detail.noItems")}</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {product.items.map((item) => (
                <ItemCard key={item.id} item={item} product={product} t={t} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: -0.3,
  },
  topBarRight: {
    width: 36,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorsWrap: {
    margin: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: "100%",
    height: 240,
    backgroundColor: THEME.mint2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  productName: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.7,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: THEME.muted,
    marginBottom: 12,
  },
  quantityBadge: {
    alignSelf: "flex-start",
    backgroundColor: THEME.mint,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  quantityBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.text,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  dietBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dietBadgeGreen: {
    backgroundColor: "#DCFCE7",
  },
  dietBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    gap: 10,
  },
  infoIcon: {
    width: 22,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: THEME.muted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.3,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.mint2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addItemText: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.primary,
  },
  itemsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  itemCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  itemCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  expirationText: {
    fontSize: 13,
    fontWeight: "700",
  },
  expirationMuted: {
    fontSize: 13,
    color: THEME.muted,
  },
  itemCardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  itemDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemDetailText: {
    fontSize: 14,
    color: THEME.text,
  },
  emptyItems: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  emptyItemsText: {
    fontSize: 15,
    color: THEME.muted,
  },
});
