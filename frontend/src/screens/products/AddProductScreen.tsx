import React, { useMemo, useState } from "react";
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { THEME } from "../../theme/theme";
import { FormLabel } from "../../components/FormLabel";
import { InputLabel } from "../../components/users/InputLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { createProduct } from "../../api/products/productService";

type Props = NativeStackScreenProps<AuthStackParamList, "AddProduct">;

type ProductUnit = "G" | "KG" | "ML" | "L" | "UNIT";
type NutriScore = "A" | "B" | "C" | "D" | "E";
type NovaGroup = "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";

type ExistingProduct = {
  id: number;
  barcode: string;
  name: string;
  image?: string | null;
};

type ProductFormErrors = Partial<{
  name: string;
  quantity: string;
}>;

const MOCK_PRODUCTS: ExistingProduct[] = [
  {
    id: 1,
    barcode: "8437015942011",
    name: "Leche Entera",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    barcode: "8410000000123",
    name: "Arroz Redondo",
    image: null,
  },
  {
    id: 3,
    barcode: "8420000000456",
    name: "Tomate Triturado",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  },
];

const GENERIC_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80";

const UNIT_OPTIONS: Array<{ label: string; value: ProductUnit }> = [
  { label: "g", value: "G" },
  { label: "kg", value: "KG" },
  { label: "ml", value: "ML" },
  { label: "l", value: "L" },
  { label: "ud", value: "UNIT" },
];

const NUTRI_OPTIONS: Array<{ label: string; value: NutriScore }> = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
];

const NOVA_OPTIONS: Array<{ label: string; value: NovaGroup }> = [
  { label: "1", value: "GROUP_1" },
  { label: "2", value: "GROUP_2" },
  { label: "3", value: "GROUP_3" },
  { label: "4", value: "GROUP_4" },
];

const NUTRI_COLORS: Record<NutriScore, string> = {
  A: "#39D27A",
  B: "#D7E8BB",
  C: "#F1E5A7",
  D: "#EFC0B2",
  E: "#E8B5BA",
};

const NUTRI_SELECTED_COLORS: Record<NutriScore, string> = {
  A: "#0FA958",
  B: "#AFCF7F",
  C: "#E3CE65",
  D: "#DE9C88",
  E: "#D6878E",
};

const NOVA_COLORS: Record<NovaGroup, string> = {
  GROUP_1: "#6EE49A",
  GROUP_2: "#EFE2A9",
  GROUP_3: "#EDCFB0",
  GROUP_4: "#EAB7B7",
};

const NOVA_SELECTED_COLORS: Record<NovaGroup, string> = {
  GROUP_1: "#2AC560",
  GROUP_2: "#D9C66B",
  GROUP_3: "#DFAE7E",
  GROUP_4: "#D38787",
};

function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockSearchProducts(query: string): Promise<ExistingProduct[]> {
  await mockDelay(300);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return MOCK_PRODUCTS.filter((item) => {
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.barcode.includes(normalized)
    );
  });
}

async function mockCreateProduct() {
  await mockDelay(600);
}

async function mockAddItemToPantry() {
  await mockDelay(600);
}

type DropdownFieldProps<T extends string> = {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
};

function DropdownField<T extends string>({
  label,
  options,
  value,
  onChange,
}: DropdownFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  return (
    <View style={styles.dropdownWrap}>
      <FormLabel text={label} />
      <Pressable style={styles.dropdownTrigger} onPress={() => setOpen((prev) => !prev)}>
        <Text style={styles.dropdownValue}>{selectedLabel}</Text>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={THEME.muted}
        />
      </Pressable>

      {open ? (
        <View style={styles.dropdownMenu}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
              >
                <Text style={[styles.dropdownItemText, selected && styles.dropdownItemTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function OptionalBooleanField({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <View style={styles.optionalBoolWrap}>
      <View style={styles.switchLabelWrap}>
        <MaterialCommunityIcons name={icon} size={18} color="#16A34A" />
        <Text style={styles.switchLabel}>{label}</Text>
      </View>

      <View style={styles.optionalBoolButtons}>
        <Pressable
          style={[styles.boolBtn, value === true && styles.boolBtnActive]}
          onPress={() => onChange(value === true ? null : true)}
        >
          <Text style={[styles.boolBtnText, value === true && styles.boolBtnTextActive]}>Sí</Text>
        </Pressable>
        <Pressable
          style={[styles.boolBtn, value === false && styles.boolBtnActive]}
          onPress={() => onChange(value === false ? null : false)}
        >
          <Text style={[styles.boolBtnText, value === false && styles.boolBtnTextActive]}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AddProductScreen({ navigation, route }: Props) {
  const [isFirstTime, setIsFirstTime] = useState(true);

  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("ML");
  const [defaultPrice, setDefaultPrice] = useState("");

  const [vegetarian, setVegetarian] = useState<boolean | null>(null);
  const [vegan, setVegan] = useState<boolean | null>(null);
  const [nutriScoreGrade, setNutriScoreGrade] = useState<NutriScore | null>(null);
  const [novaGroup, setNovaGroup] = useState<NovaGroup | null>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ExistingProduct | null>(null);
  const [searching, setSearching] = useState(false);

  const [purchaseDate, setPurchaseDate] = useState("2026-03-04");
  const [expirationDate, setExpirationDate] = useState("");
  const [pricePaid, setPricePaid] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const isFirstFlowValid = useMemo(() => {
    return name.trim().length > 0 && quantity.trim().length > 0;
  }, [name, quantity]);

  const onSearchChange = async (value: string) => {
    setSearch(value);
    setSelectedProduct(null);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const result = await mockSearchProducts(value);
    setSearchResults(result);
    setSearching(false);
  };

  const validateFirstFlow = (): ProductFormErrors => {
    const next: ProductFormErrors = {};

    if (!name.trim()) next.name = "Campo obligatorio";
    if (!quantity.trim()) next.quantity = "Campo obligatorio";

    return next;
  };

  const onSubmitFirstFlow = async () => {
    if (submitting) return;

    const nextErrors = validateFirstFlow();
    setErrors(nextErrors);
    setGlobalErrors([]);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    const product = {
      barcode: barcode.trim() || null,
      name: name.trim(),
      image,
      quantity: quantity.trim(),
      unit,
      defaultPrice: defaultPrice.trim() || null,
      brand: brand.trim() || null,
      isVegetarian: vegetarian,
      isVegan: vegan,
      nutriScoreGrade,
      novaGroup,
    };

    await createProduct(
      10,
      product,
      () => {
        navigation.goBack();
      },
      (err) => {
        if (err.fieldErrors) {
          const fieldErrors = err.fieldErrors;
          setErrors((prev) => ({
            ...prev,
            name: fieldErrors.name
              ? Array.isArray(fieldErrors.name)
                ? fieldErrors.name[0]
                : fieldErrors.name
              : prev.name,
            quantity: fieldErrors.quantity
              ? Array.isArray(fieldErrors.quantity)
                ? fieldErrors.quantity[0]
                : fieldErrors.quantity
              : prev.quantity,
          }));
        }

        setGlobalErrors(err.globalErrors ?? ["No se ha podido guardar el producto."]);
      }
    );

    setSubmitting(false);
  };

  const onSubmitExistingFlow = async () => {
    if (!selectedProduct || submitting) return;

    try {
      setSubmitting(true);
      setGlobalErrors([]);
      await mockAddItemToPantry();
      navigation.goBack();
    } catch {
      setGlobalErrors(["No se ha podido añadir a despensa. Inténtalo de nuevo."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo Producto</Text>
        <Pressable hitSlop={10}>
          <MaterialCommunityIcons name="help-circle" size={24} color={THEME.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>¿Es la primera vez que añades este producto?</Text>

        <View style={styles.segmentedWrap}>
          <Pressable
            style={[styles.segmentBtn, isFirstTime && styles.segmentBtnActive]}
            onPress={() => {
              setIsFirstTime(true);
              setSelectedProduct(null);
            }}
          >
            <Text style={[styles.segmentText, isFirstTime && styles.segmentTextActive]}>
              Sí, es la primera vez
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, !isFirstTime && styles.segmentBtnActive]}
            onPress={() => setIsFirstTime(false)}
          >
            <Text style={[styles.segmentText, !isFirstTime && styles.segmentTextActive]}>No</Text>
          </Pressable>
        </View>

        {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

        {isFirstTime ? (
          <>
            <Pressable
              style={styles.imageUploadBox}
              onPress={() => setImage((prev) => (prev ? null : "mock://product-image"))}
            >
              <MaterialCommunityIcons name="camera-plus" size={34} color={THEME.primary} />
              <Text style={styles.imageUploadText}>
                {image ? "Imagen seleccionada" : "Añadir imagen del producto"}
              </Text>
            </Pressable>

            <FormLabel text="Código de barras" />
            <InputLabel
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Escanea o escribe el código"
              rightIcon="barcode-outline"
            />

            <FormLabel text="Nombre del producto *" />
            <InputLabel
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Ej. Leche desnatada"
              errorText={errors.name}
            />

            <FormLabel text="Marca" />
            <InputLabel
              value={brand}
              onChangeText={setBrand}
              placeholder="Ej. Pascual"
            />

            <View style={styles.rowFields}>
              <View style={styles.rowFieldLeft}>
                <FormLabel text="Cantidad" />
                <InputLabel
                  value={quantity}
                  onChangeText={(value) => {
                    setQuantity(value);
                    setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  errorText={errors.quantity}
                />
              </View>

              <View style={styles.rowFieldRight}>
                <DropdownField
                  label="Unidad"
                  value={unit}
                  options={UNIT_OPTIONS}
                  onChange={setUnit}
                />
              </View>
            </View>

            <FormLabel text="Precio pagado (€)" />
            <InputLabel
              value={defaultPrice}
              onChangeText={setDefaultPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            <View style={styles.moreInfoBox}>
              <Pressable
                style={styles.moreInfoHeader}
                onPress={() => setShowAdditionalInfo((prev) => !prev)}
              >
                <Text style={styles.moreInfoTitle}>¿Quieres añadir más información?</Text>
                <MaterialCommunityIcons
                  name={showAdditionalInfo ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={THEME.muted}
                />
              </Pressable>
              <Text style={styles.moreInfoText}>
                Complétala solo si conoces estos datos.
              </Text>

              {showAdditionalInfo ? (
                <>
                  <OptionalBooleanField
                    label="Vegetariano"
                    icon="leaf"
                    value={vegetarian}
                    onChange={setVegetarian}
                  />

                  <OptionalBooleanField
                    label="Vegano"
                    icon="leaf-circle"
                    value={vegan}
                    onChange={setVegan}
                  />

                  <FormLabel text="NutriScore" />
                  <View style={styles.gradeRow}>
                    {NUTRI_OPTIONS.map((option) => {
                      const selected = nutriScoreGrade === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setNutriScoreGrade(selected ? null : option.value)}
                          style={[
                            styles.gradePill,
                            {
                              backgroundColor: selected
                                ? NUTRI_SELECTED_COLORS[option.value]
                                : NUTRI_COLORS[option.value],
                            },
                            !selected && styles.gradePillDim,
                            selected && styles.gradePillSelected,
                          ]}
                        >
                          <Text style={[styles.gradePillText, !selected && styles.gradePillTextDim]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <FormLabel text="Grado NOVA" />
                  <View style={styles.gradeRow}>
                    {NOVA_OPTIONS.map((option) => {
                      const selected = novaGroup === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setNovaGroup(selected ? null : option.value)}
                          style={[
                            styles.gradePill,
                            {
                              backgroundColor: selected
                                ? NOVA_SELECTED_COLORS[option.value]
                                : NOVA_COLORS[option.value],
                            },
                            !selected && styles.gradePillDim,
                            selected && styles.gradePillSelected,
                          ]}
                        >
                          <Text style={[styles.gradePillText, !selected && styles.gradePillTextDim]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}
            </View>

            <PrimaryButton
              text="Guardar producto"
              onPress={onSubmitFirstFlow}
              disabled={submitting || !isFirstFlowValid}
            />
          </>
        ) : (
          <>
            <View style={styles.searchWrap}>
              <InputLabel
                leftIcon="search"
                value={search}
                onChangeText={onSearchChange}
                placeholder="Buscar producto"
              />
            </View>

            {searching ? (
              <View style={styles.centerRow}>
                <ActivityIndicator color={THEME.primary} />
              </View>
            ) : null}

            {!selectedProduct && search.trim() && !searching ? (
              <View style={styles.searchResultsWrap}>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.searchResultItem}
                      onPress={() => {
                        setSelectedProduct(item);
                        setSearch(item.name);
                      }}
                    >
                      <Text style={styles.searchResultText}>{item.name}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.emptySearchText}>No se encontró ningún producto</Text>
                )}
              </View>
            ) : null}

            {selectedProduct ? (
              <>
                <View style={styles.productCard}>
                  <View style={styles.selectedProductRow}>
                    <Image
                      source={{ uri: selectedProduct.image || GENERIC_FOOD_IMAGE }}
                      style={styles.selectedProductImage}
                    />
                    <View style={styles.cardSingleInfo}>
                      <Text style={styles.cardName}>{selectedProduct.name}</Text>
                      <Text style={styles.cardHint}>Producto seleccionado</Text>
                    </View>
                  </View>
                </View>

                <FormLabel text="Fecha de Compra" />
                <InputLabel
                  leftIcon="calendar-outline"
                  rightIcon="calendar-outline"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  placeholder="YYYY-MM-DD"
                />

                <FormLabel text="Fecha de Caducidad" />
                <InputLabel
                  leftIcon="calendar-clear-outline"
                  rightIcon="calendar-outline"
                  value={expirationDate}
                  onChangeText={setExpirationDate}
                  placeholder="YYYY-MM-DD"
                />

                <FormLabel text="Precio Pagado (€)" />
                <InputLabel
                  leftIcon="cash-outline"
                  value={pricePaid}
                  onChangeText={setPricePaid}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />

                <PrimaryButton
                  text="Añadir a despensa"
                  onPress={onSubmitExistingFlow}
                  disabled={submitting || !selectedProduct}
                  rightIcon="cart-plus"
                />
              </>
            ) : null}
          </>
        )}

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  header: {
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.bg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  question: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 16,
  },
  segmentedWrap: {
    backgroundColor: "#DDEFE4",
    borderRadius: 28,
    padding: 4,
    flexDirection: "row",
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#2ADE74",
  },
  segmentText: {
    color: "#4C6256",
    fontSize: 15,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#0F2118",
  },
  imageUploadBox: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#A7EEC3",
    borderRadius: 24,
    backgroundColor: THEME.mint,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
  },
  imageUploadText: {
    color: "#223348",
    fontSize: 16,
    fontWeight: "500",
  },
  rowFields: {
    flexDirection: "row",
    gap: 10,
  },
  rowFieldLeft: {
    flex: 2,
  },
  rowFieldRight: {
    flex: 1,
  },
  moreInfoBox: {
    marginTop: 6,
    paddingTop: 6,
  },
  moreInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreInfoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 4,
  },
  moreInfoText: {
    fontSize: 13,
    lineHeight: 18,
    color: THEME.muted,
    marginBottom: 10,
  },
  optionalBoolWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  optionalBoolButtons: {
    flexDirection: "row",
    gap: 8,
  },
  boolBtn: {
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C7D2D9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F5F7",
    paddingHorizontal: 10,
  },
  boolBtnActive: {
    borderColor: "#2ADE74",
    backgroundColor: "#DFF8E9",
  },
  boolBtnText: {
    fontSize: 13,
    color: "#5A6B78",
    fontWeight: "600",
  },
  boolBtnTextActive: {
    color: "#0E1A13",
  },
  switchLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "600",
  },
  dropdownWrap: {
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  gradePill: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  gradePillSelected: {
    borderColor: "#0D1B13",
    borderWidth: 2,
  },
  gradePillDim: {
    opacity: 0.58,
  },
  gradePillText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  gradePillTextDim: {
    color: "rgba(255,255,255,0.78)",
  },
  nutriA: { backgroundColor: "#0FA958" },
  nutriB: { backgroundColor: "#BCD697" },
  nutriC: { backgroundColor: "#EAD97F" },
  nutriD: { backgroundColor: "#E7AA96" },
  nutriE: { backgroundColor: "#DF9AA0" },
  nova1: { backgroundColor: "#2AC560" },
  nova2: { backgroundColor: "#E7D88D" },
  nova3: { backgroundColor: "#E8C39C" },
  nova4: { backgroundColor: "#E3A6A6" },
  dropdownTrigger: {
    height: 54,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FCFA",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: 16,
    color: THEME.text,
  },
  dropdownMenu: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownItemSelected: {
    backgroundColor: THEME.mint,
  },
  dropdownItemText: {
    fontSize: 15,
    color: THEME.text,
  },
  dropdownItemTextSelected: {
    fontWeight: "700",
  },
  searchWrap: {
    marginTop: 10,
  },
  centerRow: {
    alignItems: "center",
    marginBottom: 10,
  },
  searchResultsWrap: {
    marginTop: 4,
    marginBottom: 14,
    gap: 8,
  },
  searchResultItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FCFA",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "600",
  },
  emptySearchText: {
    fontSize: 14,
    color: THEME.muted,
  },
  productCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D7E2EF",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 14,
  },
  selectedProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedProductImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#EEF3F7",
  },
  cardSingleInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    color: THEME.text,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 12,
    color: THEME.muted,
  },
  cancelBtn: {
    marginTop: 14,
    alignSelf: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E7388",
  },
});
