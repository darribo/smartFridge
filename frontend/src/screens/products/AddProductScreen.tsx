import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
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
import { DatePickerField } from "../../components/common/DatePickerField";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { createProduct, createProductItem, searchProductsByName } from "../../api/products/productService";
import { useTranslation } from "react-i18next";
import type { ApiError } from "../../api/appFetch";

type Props = NativeStackScreenProps<AuthStackParamList, "AddProduct">;

type ProductUnit = "G" | "KG" | "ML" | "L" | "UNIT";
type NutriScore = "A" | "B" | "C" | "D" | "E";
type NovaGroup = "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";

type ExistingProduct = {
  id: number;
  barcode: string;
  name: string;
  image?: string | null;
  defaultPrice?: string | null;
};

type ProductFormErrors = Partial<{
  name: string;
  quantity: string;
  defaultPrice: string;
  pricePaid: string;
  purchaseDate: string;
}>;

type InfoCardKey = "nutriScore" | "novaGroup" | null;

const GENERIC_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80";

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

const toIsoDateTimeOrNull = (value: Date | null): string | null => {
  if (!value) return null;
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00`;
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const DECIMAL_LIMIT = 999.99;

const parseNonNegativeDecimal = (raw: string): number => {
  const value = raw.trim();
  if (!value) return Number.NaN;
  const normalized = value.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return Number.NaN;
  return parsed;
};

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
  yesText,
  noText,
  value,
  onChange,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  yesText: string;
  noText: string;
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
          <Text style={[styles.boolBtnText, value === true && styles.boolBtnTextActive]}>{yesText}</Text>
        </Pressable>
        <Pressable
          style={[styles.boolBtn, value === false && styles.boolBtnActive]}
          onPress={() => onChange(value === false ? null : false)}
        >
          <Text style={[styles.boolBtnText, value === false && styles.boolBtnTextActive]}>{noText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoFieldLabel({
  text,
  onPress,
  style,
}: {
  text: string;
  onPress: () => void;
  style?: object;
}) {
  return (
    <View style={[styles.infoLabelRow, style]}>
      <FormLabel text={text} />
      <Pressable onPress={onPress} hitSlop={10} style={styles.infoLabelBtn}>
        <MaterialCommunityIcons name="help-circle" size={20} color={THEME.muted} />
      </Pressable>
    </View>
  );
}

export default function AddProductScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const householdId = route.params?.householdId ?? 10;
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

  const [purchaseDate, setPurchaseDate] = useState<Date | null>(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const tomorrowDate = useMemo(() => getTomorrowDate(), []);
  const [pricePaid, setPricePaid] = useState("");
  const [itemCount, setItemCount] = useState(1);


  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [infoCard, setInfoCard] = useState<InfoCardKey>(null);

  const unitOptions = useMemo(
    () => [
      { label: t("addProduct.units.g"), value: "G" as ProductUnit },
      { label: t("addProduct.units.kg"), value: "KG" as ProductUnit },
      { label: t("addProduct.units.ml"), value: "ML" as ProductUnit },
      { label: t("addProduct.units.l"), value: "L" as ProductUnit },
      { label: t("addProduct.units.unit"), value: "UNIT" as ProductUnit },
    ],
    [t]
  );

  const nutriOptions = useMemo(
    () => [
      { label: "A", value: "A" as NutriScore },
      { label: "B", value: "B" as NutriScore },
      { label: "C", value: "C" as NutriScore },
      { label: "D", value: "D" as NutriScore },
      { label: "E", value: "E" as NutriScore },
    ],
    []
  );

  const novaOptions = useMemo(
    () => [
      { label: "1", value: "GROUP_1" as NovaGroup },
      { label: "2", value: "GROUP_2" as NovaGroup },
      { label: "3", value: "GROUP_3" as NovaGroup },
      { label: "4", value: "GROUP_4" as NovaGroup },
    ],
    []
  );

  const decrementCount = () => setItemCount((prev) => Math.max(1, prev - 1));
  const incrementCount = () => setItemCount((prev) => Math.min(99, prev + 1));

  const isFirstFlowValid = useMemo(() => {
    return name.trim().length > 0 && quantity.trim().length > 0;
  }, [name, quantity]);

  const onSearchChange = async (value: string) => {
    setSearch(value);
    setSelectedProduct(null);
    setGlobalErrors([]);

    if (!value.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    await searchProductsByName(
      householdId,
      value.trim(),
      0,
      (block) => {
        const mappedResults: ExistingProduct[] = block.items.map((item) => ({
          id: item.id,
          barcode: item.barcode ?? "",
          name: item.name,
          image: item.image ?? null,
          defaultPrice: item.defaultPrice ?? null,
        }));
        setSearchResults(mappedResults);
      },
      (err) => {
        setSearchResults([]);
        setGlobalErrors(err.globalErrors ?? [t("addProduct.errors.searchFailed")]);
      }
    );
    setSearching(false);
  };

  const validateFirstFlow = (): ProductFormErrors => {
    const next: ProductFormErrors = {};

    if (!name.trim()) next.name = t("genericErrors.requiredField");
    else if (name.trim().length > 30) next.name = t("genericErrors.max", { max: 30 });
    if (!quantity.trim()) {
      next.quantity = t("genericErrors.requiredField");
    } else {
      const parsedQuantity = parseNonNegativeDecimal(quantity);
      if (Number.isNaN(parsedQuantity)) next.quantity = t("addProduct.errors.invalidDecimal");
      else if (parsedQuantity > DECIMAL_LIMIT) next.quantity = t("addProduct.errors.maxDecimal");
    }

    if (defaultPrice.trim()) {
      const parsedDefaultPrice = parseNonNegativeDecimal(defaultPrice);
      if (Number.isNaN(parsedDefaultPrice)) next.defaultPrice = t("addProduct.errors.invalidDecimal");
      else if (parsedDefaultPrice > DECIMAL_LIMIT) next.defaultPrice = t("addProduct.errors.maxDecimal");
    }

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
      householdId,
      product,
      (createdProduct) => {
        setIsFirstTime(false);
        setSelectedProduct({
          id: createdProduct.id,
          barcode: createdProduct.barcode ?? "",
          name: createdProduct.name,
          image: createdProduct.image ?? null,
          defaultPrice: createdProduct.defaultPrice ?? null,
        });
        setSearch(createdProduct.name);
        setPricePaid(createdProduct.defaultPrice ?? "");
        setItemCount(1);
        setGlobalErrors([]);
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
            defaultPrice: fieldErrors.defaultPrice
              ? Array.isArray(fieldErrors.defaultPrice)
                ? fieldErrors.defaultPrice[0]
                : fieldErrors.defaultPrice
              : prev.defaultPrice,
          }));
        }

        setGlobalErrors(err.globalErrors ?? [t("addProduct.errors.saveFailed")]);
      }
    );

    setSubmitting(false);
  };

  const onSubmitExistingFlow = async () => {
    if (!selectedProduct || submitting) return;
    if (itemCount < 1) {
      setGlobalErrors([t("addProduct.errors.invalidItemCount")]);
      return;
    }

    const nextErrors: ProductFormErrors = {};
    if (!purchaseDate) nextErrors.purchaseDate = t("genericErrors.requiredField");
    if (pricePaid.trim()) {
      const parsedPricePaid = parseNonNegativeDecimal(pricePaid);
      if (Number.isNaN(parsedPricePaid)) nextErrors.pricePaid = t("addProduct.errors.invalidDecimal");
      else if (parsedPricePaid > DECIMAL_LIMIT) nextErrors.pricePaid = t("addProduct.errors.maxDecimal");
    }

    setErrors((prev) => ({
      ...prev,
      purchaseDate: nextErrors.purchaseDate,
      pricePaid: nextErrors.pricePaid,
    }));
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setGlobalErrors([]);
    let firstError: ApiError | null = null;

    const createSingleItem = () =>
      new Promise<ApiError | null>((resolve) => {
        createProductItem(
          selectedProduct.id,
          toIsoDateTimeOrNull(purchaseDate),
          toIsoDateTimeOrNull(expirationDate),
          pricePaid.trim() || null,
          () => resolve(null),
          (err) => resolve(err)
        );
      });

    for (let i = 0; i < itemCount; i++) {
      // eslint-disable-next-line no-await-in-loop
      const requestError = await createSingleItem();
      if (requestError) {
        firstError = requestError;
        break;
      }
    }

    if (firstError) {
      const fieldErrors = firstError.fieldErrors;
      if (fieldErrors?.pricePaid) {
        setErrors((prev) => ({
          ...prev,
          pricePaid: Array.isArray(fieldErrors.pricePaid) ? fieldErrors.pricePaid[0] : fieldErrors.pricePaid,
        }));
      }
      setGlobalErrors(firstError.globalErrors ?? [t("addProduct.errors.addToPantryFailed")]);
      setSubmitting(false);
      return;
    }

    navigation.goBack();

    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("addProduct.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>{t("addProduct.firstTimeQuestion")}</Text>

        <View style={styles.segmentedWrap}>
          <Pressable
            style={[styles.segmentBtn, isFirstTime && styles.segmentBtnActive]}
            onPress={() => {
              setIsFirstTime(true);
              setSelectedProduct(null);
            }}
          >
            <Text style={[styles.segmentText, isFirstTime && styles.segmentTextActive]}>
              {t("addProduct.firstTimeYes")}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, !isFirstTime && styles.segmentBtnActive]}
            onPress={() => setIsFirstTime(false)}
          >
            <Text style={[styles.segmentText, !isFirstTime && styles.segmentTextActive]}>
              {t("addProduct.firstTimeNo")}
            </Text>
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
                {image ? t("addProduct.imageSelected") : t("addProduct.addImage")}
              </Text>
            </Pressable>

            <FormLabel text={t("addProduct.fields.barcode")} />
            <InputLabel
              value={barcode}
              onChangeText={setBarcode}
              placeholder={t("addProduct.placeholders.barcode")}
              rightIcon="barcode-outline"
            />

            <FormLabel text={t("addProduct.fields.productNameRequired")} />
            <InputLabel
              value={name}
              onChangeText={(value) => {
                setName(value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              maxLength={30}
              placeholder={t("addProduct.placeholders.productName")}
              errorText={errors.name}
            />

            <FormLabel text={t("addProduct.fields.brand")} />
            <InputLabel
              value={brand}
              onChangeText={setBrand}
              placeholder={t("addProduct.placeholders.brand")}
            />

            <View style={styles.rowFields}>
              <View style={styles.rowFieldLeft}>
                <FormLabel text={t("addProduct.fields.quantityRequired")} />
                <InputLabel
                  value={quantity}
                  onChangeText={(value) => {
                    setQuantity(value);
                    setErrors((prev) => ({ ...prev, quantity: undefined }));
                  }}
                  placeholder={t("addProduct.placeholders.decimal")}
                  keyboardType="decimal-pad"
                  errorText={errors.quantity}
                />
              </View>

              <View style={styles.rowFieldRight}>
                <DropdownField
                  label={t("addProduct.fields.unitRequired")}
                  value={unit}
                  options={unitOptions}
                  onChange={setUnit}
                />
              </View>
            </View>

            <FormLabel text={t("addProduct.fields.defaultPrice")} />
            <InputLabel
              value={defaultPrice}
              onChangeText={(value) => {
                setDefaultPrice(value);
                setErrors((prev) => ({ ...prev, defaultPrice: undefined }));
              }}
              placeholder={t("addProduct.placeholders.decimal")}
              keyboardType="decimal-pad"
              errorText={errors.defaultPrice}
            />

            <View style={styles.moreInfoBox}>
              <Pressable
                style={styles.moreInfoHeader}
                onPress={() => setShowAdditionalInfo((prev) => !prev)}
              >
                <Text style={styles.moreInfoTitle}>{t("addProduct.moreInfo.title")}</Text>
                <MaterialCommunityIcons
                  name={showAdditionalInfo ? "chevron-up" : "chevron-down"}
                  size={22}
                  color={THEME.muted}
                />
              </Pressable>
              <Text style={styles.moreInfoText}>
                {t("addProduct.moreInfo.subtitle")}
              </Text>

              {showAdditionalInfo ? (
                <>
                  <OptionalBooleanField
                    label={t("addProduct.fields.vegetarian")}
                    icon="leaf"
                    yesText={t("addProduct.common.yes")}
                    noText={t("addProduct.common.no")}
                    value={vegetarian}
                    onChange={setVegetarian}
                  />

                  <OptionalBooleanField
                    label={t("addProduct.fields.vegan")}
                    icon="leaf-circle"
                    yesText={t("addProduct.common.yes")}
                    noText={t("addProduct.common.no")}
                    value={vegan}
                    onChange={setVegan}
                  />

                  <InfoFieldLabel
                    text={t("addProduct.fields.nutriScore")}
                    onPress={() => setInfoCard("nutriScore")}
                    style={styles.nutriInfoLabel}
                  />
                  <View style={styles.gradeRow}>
                    {nutriOptions.map((option) => {
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

                  <InfoFieldLabel text={t("addProduct.fields.novaGroup")} onPress={() => setInfoCard("novaGroup")} />
                  <View style={styles.gradeRow}>
                    {novaOptions.map((option) => {
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
              text={t("addProduct.actions.saveProduct")}
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
                placeholder={t("addProduct.placeholders.searchProduct")}
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
                      setPricePaid(item.defaultPrice ?? "");
                      setItemCount(1);
                    }}
                  >
                      <Text style={styles.searchResultText}>{item.name}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.emptySearchText}>{t("addProduct.emptySearch")}</Text>
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
                      <Text style={styles.cardName} numberOfLines={2}>
                        {selectedProduct.name}
                      </Text>
                      <Text style={styles.cardHint}>{t("addProduct.selectedProductHint")}</Text>
                    </View>
                    <View style={styles.itemStepper}>
                      <Pressable
                        style={styles.itemCountBtn}
                        onPress={decrementCount}
                        accessibilityLabel={t("addProduct.actions.decrease")}
                      >
                        <MaterialCommunityIcons name="minus" size={18} color={THEME.text} />
                      </Pressable>
                      <Text style={styles.itemCountValue}>{itemCount}</Text>
                      <Pressable
                        style={styles.itemCountBtn}
                        onPress={incrementCount}
                        accessibilityLabel={t("addProduct.actions.increase")}
                      >
                        <MaterialCommunityIcons name="plus" size={18} color={THEME.text} />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <DatePickerField
                  label={t("addProduct.fields.purchaseDateRequired")}
                  value={purchaseDate}
                  onChange={(value) => {
                    setPurchaseDate(value);
                    setErrors((prev) => ({ ...prev, purchaseDate: undefined }));
                  }}
                  placeholder={t("addProduct.placeholders.date")}
                  errorText={errors.purchaseDate}
                  maximumDate={new Date()}
                />

                <DatePickerField
                  label={t("addProduct.fields.expirationDate")}
                  value={expirationDate}
                  onChange={setExpirationDate}
                  placeholder={t("addProduct.placeholders.date")}
                  initialPickerDate={tomorrowDate}
                  clearable
                />

                <FormLabel text={t("addProduct.fields.pricePaid")} />
                <InputLabel
                  leftIcon="cash-outline"
                  value={pricePaid}
                  onChangeText={(value) => {
                    setPricePaid(value);
                    setErrors((prev) => ({ ...prev, pricePaid: undefined }));
                  }}
                  placeholder={t("addProduct.placeholders.decimal")}
                  keyboardType="decimal-pad"
                  errorText={errors.pricePaid}
                />

                <PrimaryButton
                  text={t("addProduct.actions.addToPantry")}
                  onPress={onSubmitExistingFlow}
                  disabled={submitting || !selectedProduct}
                  rightIcon="cart-plus"
                />
              </>
            ) : null}
          </>
        )}

        <Pressable onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{t("addProduct.actions.cancel")}</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={infoCard !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoCard(null)}
      >
        <TouchableWithoutFeedback onPress={() => setInfoCard(null)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {infoCard === "nutriScore"
                ? t("addProduct.help.nutriScore.title")
                : t("addProduct.help.novaGroup.title")}
            </Text>
            <Text style={styles.sheetBody}>
              {infoCard === "nutriScore"
                ? t("addProduct.help.nutriScore.description")
                : t("addProduct.help.novaGroup.description")}
            </Text>
            <PrimaryButton text={t("common.understood")} onPress={() => setInfoCard(null)} />
          </View>
        </View>
      </Modal>
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
  headerSpacer: {
    width: 24,
    height: 24,
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
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabelBtn: {
    marginTop: -8,
  },
  nutriInfoLabel: {
    marginTop: 8,
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
    minWidth: 0,
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
  itemStepper: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE5EC",
    backgroundColor: "#F6FAF8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 4,
  },
  itemCountBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CFE0D6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemCountValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    gap: 12,
    borderTopWidth: 1,
    borderColor: THEME.border,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#D5DCE2",
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
  },
  sheetBody: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.muted,
  },
});
