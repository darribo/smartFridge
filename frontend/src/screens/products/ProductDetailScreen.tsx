import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";
import {
  deleteProduct,
  deleteProductItem,
  getProductDetail,
  updateProductItem,
  discardProductItem,
  type ProductDetail,
  type ProductItem,
  type ProductItemStorageLocation,
  type ProductUnit,
} from "../../api/products/productService";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { resolveImage } from "../../utils/image";
import { useHouseholdStore } from "../../store/householdStore";
import {
  DropdownField,
  parseNonNegativeDecimal,
  PRICE_LIMIT,
  QUANTITY_LIMIT,
  toIsoDateTimeOrNull,
} from "./AddProductShared";
import { DatePickerField } from "../../components/common/DatePickerField";
import { FormLabel } from "../../components/FormLabel";

type Props = NativeStackScreenProps<AuthStackParamList, "ProductDetail">;

function formatDate(date: string | null | undefined, emptyText: string) {
  if (!date) return emptyText;
  const d = new Date(date);
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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

type ItemCardProps = {
  item: ProductItem;
  product: ProductDetail;
  t: (key: string, opts?: any) => string;
  onEdit: () => void;
  onDelete: () => void;
  onDiscard: () => void;
};

function ItemCard({ item, product, t, onEdit, onDelete, onDiscard }: ItemCardProps) {
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

      <View style={styles.itemCardActions}>
        <Pressable onPress={onEdit} style={styles.itemActionBtn}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={THEME.primary} />
          <Text style={styles.itemActionText}>{t("editProduct.editItem")}</Text>
        </Pressable>
        <Pressable onPress={onDiscard} style={styles.itemActionBtn}>
          <MaterialCommunityIcons name="delete-sweep-outline" size={16} color="#D97706" />
          <Text style={[styles.itemActionText, styles.itemActionTextDiscard]}>{t("editProduct.discardItem")}</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={[styles.itemActionBtn, styles.itemActionBtnDelete]}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
          <Text style={[styles.itemActionText, styles.itemActionTextDelete]}>{t("editProduct.deleteItem")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

type EditItemModalProps = {
  item: ProductItem | null;
  product: ProductDetail;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  t: (key: string, opts?: any) => string;
};

function EditItemModal({ item, product, visible, onClose, onSaved, t }: EditItemModalProps) {
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [pricePaid, setPricePaid] = useState("");
  const [storageLocation, setStorageLocation] = useState<ProductItemStorageLocation>("FRIDGE");
  const [initialQuantityValue, setInitialQuantityValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ pricePaid?: string; quantity?: string }>({});

  React.useEffect(() => {
    if (item) {
      setExpirationDate(item.expirationDate ? new Date(item.expirationDate) : null);
      setPricePaid(item.pricePaid ?? "");
      setStorageLocation(item.storageLocation);
      setInitialQuantityValue(item.initialQuantityValue ?? "");
      setErrors([]);
      setFieldErrors({});
    }
  }, [item]);

  const locationOptions: Array<{ label: string; value: ProductItemStorageLocation }> = [
    { label: t("addProduct.storageLocations.pantry"), value: "PANTRY" },
    { label: t("addProduct.storageLocations.fridge"), value: "FRIDGE" },
    { label: t("addProduct.storageLocations.freezer"), value: "FREEZER" },
  ];

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (pricePaid.trim()) {
      const p = parseNonNegativeDecimal(pricePaid);
      if (isNaN(p)) errs.pricePaid = t("addProduct.errors.invalidDecimal");
      else if (p > PRICE_LIMIT) errs.pricePaid = t("addProduct.errors.maxDecimal");
    }
    if (initialQuantityValue.trim()) {
      const q = parseNonNegativeDecimal(initialQuantityValue);
      if (isNaN(q)) errs.quantity = t("addProduct.errors.invalidDecimal");
      else if (q > QUANTITY_LIMIT) errs.quantity = t("addProduct.errors.maxQuantity");
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!item || !validate()) return;
    setSaving(true);
    setErrors([]);

    const expDateFormatted = toIsoDateTimeOrNull(expirationDate);

    updateProductItem(
      product.id,
      item.id,
      {
        expirationDate: expDateFormatted,
        pricePaid: pricePaid.trim() || null,
        storageLocation,
        initialQuantityValue: initialQuantityValue.trim() || null,
      },
      () => {
        setSaving(false);
        onSaved();
      },
      (err) => {
        setSaving(false);
        setErrors(err.globalErrors ?? [t("editProduct.saveItemFailed")]);
      }
    );
  };

  const quantityUnit = product.unit === "UNIT" ? "ud" : (product.unit?.toLowerCase() ?? "");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{t("editProduct.editItem")}</Text>

          {errors.length > 0 ? <GlobalErrorBox messages={errors} /> : null}

          <DatePickerField
            label={t("addProduct.fields.expirationDate")}
            value={expirationDate}
            onChange={setExpirationDate}
            placeholder={t("addProduct.placeholders.date")}
            clearable
          />

          <FormLabel text={t("addProduct.fields.pricePaid")} />
          <TextInput
            style={[styles.sheetInput, fieldErrors.pricePaid ? styles.sheetInputError : null]}
            value={pricePaid}
            onChangeText={setPricePaid}
            placeholder={t("addProduct.placeholders.decimal")}
            placeholderTextColor={THEME.muted}
            keyboardType="decimal-pad"
          />
          {fieldErrors.pricePaid ? <Text style={styles.sheetErrorText}>{fieldErrors.pricePaid}</Text> : null}

          <FormLabel text={t("addProduct.fields.initialQuantityValue", { unit: quantityUnit })} />
          <TextInput
            style={[styles.sheetInput, fieldErrors.quantity ? styles.sheetInputError : null]}
            value={initialQuantityValue}
            onChangeText={setInitialQuantityValue}
            placeholder={t("addProduct.placeholders.decimal")}
            placeholderTextColor={THEME.muted}
            keyboardType="decimal-pad"
          />
          {fieldErrors.quantity ? <Text style={styles.sheetErrorText}>{fieldErrors.quantity}</Text> : null}

          <DropdownField
            label={t("addProduct.fields.storageLocationRequired")}
            options={locationOptions}
            value={storageLocation}
            onChange={setStorageLocation}
          />

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.sheetSaveBtn, saving && styles.sheetSaveBtnDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sheetSaveBtnText}>{t("editProduct.save")}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { productId } = route.params;
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [editItemVisible, setEditItemVisible] = useState(false);

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

  const handleDeleteProduct = () => {
    Alert.alert(
      t("editProduct.deleteTitle"),
      t("editProduct.deleteMessage"),
      [
        { text: t("editProduct.deleteCancel"), style: "cancel" },
        {
          text: t("editProduct.deleteConfirm"),
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            deleteProduct(
              productId,
              () => navigation.goBack(),
              (err) => {
                setDeleting(false);
                Alert.alert(t("editProduct.deleteFailed"), err.globalErrors?.[0] ?? "");
              }
            );
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item: ProductItem) => {
    if (!product) return;
    Alert.alert(
      t("editProduct.deleteItemTitle"),
      t("editProduct.deleteItemMessage"),
      [
        { text: t("editProduct.deleteCancel"), style: "cancel" },
        {
          text: t("editProduct.deleteConfirm"),
          style: "destructive",
          onPress: () => {
            deleteProductItem(
              product.id,
              item.id,
              () => {
                setProduct((prev) =>
                  prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : prev
                );
              },
              (err) => Alert.alert(t("editProduct.deleteItemFailed"), err.globalErrors?.[0] ?? "")
            );
          },
        },
      ]
    );
  };

  const handleDiscardItem = (item: ProductItem) => {
    if (!product) return;
    Alert.alert(
      t("editProduct.discardItemTitle"),
      t("editProduct.discardItemMessage"),
      [
        { text: t("editProduct.deleteCancel"), style: "cancel" },
        {
          text: t("editProduct.discardConfirm"),
          style: "destructive",
          onPress: () => {
            discardProductItem(
              item.id,
              () => setProduct((prev) =>
                prev ? { ...prev, items: prev.items.filter((i) => i.id !== item.id) } : prev
              ),
              (err) => Alert.alert(t("editProduct.discardItemFailed"), err.globalErrors?.[0] ?? "")
            );
          },
        },
      ]
    );
  };

  const handleEditItem = (item: ProductItem) => {
    setEditingItem(item);
    setEditItemVisible(true);
  };

  const handleItemSaved = () => {
    setEditItemVisible(false);
    setLoading(true);
    getProductDetail(
      productId,
      (data) => { setProduct(data); setLoading(false); },
      () => setLoading(false)
    );
  };

  const quantityStr = product ? formatQuantity(product.quantity, product.unit) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.topBarBtn}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {product?.name ?? t("products.detail.title")}
        </Text>
        <View style={styles.topBarActions}>
          {product && !deleting ? (
            <>
              <Pressable
                onPress={() => navigation.navigate("EditProduct", { productId })}
                hitSlop={10}
                style={styles.topBarBtn}
              >
                <MaterialCommunityIcons name="pencil-outline" size={22} color={THEME.primary} />
              </Pressable>
              <Pressable onPress={handleDeleteProduct} hitSlop={10} style={styles.topBarBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#DC2626" />
              </Pressable>
            </>
          ) : deleting ? (
            <ActivityIndicator size="small" color={THEME.primary} />
          ) : (
            <View style={{ width: 72 }} />
          )}
        </View>
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
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Hero image */}
            <Image source={{ uri: resolveImage(true, product.image) }} style={styles.heroImage} />

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
                  <View style={[styles.dietBadge, { backgroundColor: getNovaColor(String(product.novaGroup)) + "22" }]}>
                    <Text style={[styles.dietBadgeText, { color: getNovaColor(String(product.novaGroup)) }]}>
                      NOVA {getNovaNumber(String(product.novaGroup))}
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
                  <ItemCard
                    key={item.id}
                    item={item}
                    product={product}
                    t={t}
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDeleteItem(item)}
                    onDiscard={() => handleDiscardItem(item)}
                  />
                ))}
              </View>
            )}
          </ScrollView>

          {product && (
            <EditItemModal
              item={editingItem}
              product={product}
              visible={editItemVisible}
              onClose={() => setEditItemVisible(false)}
              onSaved={handleItemSaved}
              t={t}
            />
          )}
        </>
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
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,
  },
  topBarBtn: {
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
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
  itemCardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  itemActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: THEME.border,
  },
  itemActionBtnDelete: {
    borderRightWidth: 0,
  },
  itemActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.primary,
  },
  itemActionTextDiscard: {
    color: "#D97706",
  },
  itemActionTextDelete: {
    color: "#DC2626",
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
  // Modal / sheet styles
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 4,
    borderTopWidth: 1,
    borderColor: THEME.border,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#D5DCE2",
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 8,
  },
  sheetInput: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FCFA",
    paddingHorizontal: 16,
    fontSize: 16,
    color: THEME.text,
    marginBottom: 10,
  },
  sheetInputError: {
    borderColor: "#DC2626",
  },
  sheetErrorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: -6,
    marginBottom: 8,
    marginLeft: 6,
  },
  sheetSaveBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sheetSaveBtnDisabled: {
    opacity: 0.6,
  },
  sheetSaveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
