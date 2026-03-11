import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { InputLabel } from "../../components/users/InputLabel";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { DatePickerField } from "../../components/common/DatePickerField";
import { FormLabel } from "../../components/FormLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { createProductItem, searchProductsByName } from "../../api/products/productService";
import type { ApiError } from "../../api/appFetch";
import { THEME } from "../../theme/theme";
import {
  ExistingProduct,
  getTomorrowDate,
  parseNonNegativeDecimal,
  PRICE_LIMIT,
  ProductFormErrors,
  styles,
  toIsoDateTimeOrNull,
} from "./AddProductShared";
import { GENERIC_PRODUCT_IMAGE, resolveProductImage } from "../../utils/image";

type Props = {
  householdId: number;
  selectedProductSeed?: ExistingProduct | null;
  onCompleted: () => void;
};

export default function ExistingProductItemForm({
  householdId,
  selectedProductSeed,
  onCompleted,
}: Props) {
  //Se hace la búsqueda de producto existente y la creación de uno o varios items.
  const { t } = useTranslation();
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
  const [selectedCardImageLoading, setSelectedCardImageLoading] = useState(false);
  const [selectedCardImageError, setSelectedCardImageError] = useState(false);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  useEffect(() => {
    //Se hace la precarga del producto seleccionado cuando viene de escaneo o de un alta recién creada.
    if (!selectedProductSeed) {
      return;
    }

    setSelectedProduct(selectedProductSeed);
    setSearch(selectedProductSeed.name);
    setPricePaid(selectedProductSeed.defaultPrice ?? "");
    setItemCount(1);
    setSelectedCardImageLoading(Boolean(selectedProductSeed.image));
    setSelectedCardImageError(false);
    setGlobalErrors([]);
  }, [selectedProductSeed]);

  const decrementCount = () => setItemCount((prev) => Math.max(1, prev - 1));
  const incrementCount = () => setItemCount((prev) => Math.min(99, prev + 1));
  const clearSearch = () => {
    //Se hace la limpieza completa del buscador y del producto seleccionado.
    setSearch("");
    setSearchResults([]);
    setSelectedProduct(null);
    setSearching(false);
    setGlobalErrors([]);
  };

  const onSearchChange = async (value: string) => {
    //Se hace la búsqueda en backend cada vez que el usuario escribe en el buscador.
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

  const onSubmit = async () => {
    //Se hace la creación secuencial de N items y se detiene en el primer error.
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
      else if (parsedPricePaid > PRICE_LIMIT) nextErrors.pricePaid = t("addProduct.errors.maxDecimal");
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

    setSubmitting(false);
    onCompleted();
  };

  return (
    <>
      {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

      <View style={styles.searchWrap}>
        <InputLabel
          leftIcon="search"
          value={search}
          onChangeText={onSearchChange}
          placeholder={t("addProduct.placeholders.searchProduct")}
          rightIcon={search.trim() ? "close-circle-outline" : undefined}
          onRightIconPress={clearSearch}
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
                  setSelectedCardImageLoading(Boolean(item.image));
                  setSelectedCardImageError(false);
                }}
              >
                <View style={styles.searchResultRow}>
                  <Image source={{ uri: resolveProductImage(item.image) }} style={styles.searchResultImage} />
                  <Text style={styles.searchResultText}>{item.name}</Text>
                </View>
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
              <View style={styles.selectedProductImageWrap}>
                <Image
                  source={{ uri: GENERIC_PRODUCT_IMAGE }}
                  style={[styles.selectedProductImage, styles.selectedProductImageLayer]}
                />
                <Image
                  source={{ uri: resolveProductImage(selectedProduct.image) }}
                  style={[
                    styles.selectedProductImage,
                    styles.selectedProductImageLayer,
                    (selectedCardImageLoading || selectedCardImageError) && styles.imagePreviewHidden,
                  ]}
                  onLoadStart={() => {
                    setSelectedCardImageLoading(true);
                    setSelectedCardImageError(false);
                  }}
                  onLoadEnd={() => setSelectedCardImageLoading(false)}
                  onError={() => {
                    setSelectedCardImageLoading(false);
                    setSelectedCardImageError(true);
                  }}
                />
                {selectedCardImageLoading ? (
                  <View style={styles.cardImageLoader}>
                    <ActivityIndicator size="small" color={THEME.primary} />
                  </View>
                ) : null}
              </View>
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
            onPress={onSubmit}
            disabled={submitting || !selectedProduct}
            rightIcon="cart-plus"
          />
        </>
      ) : null}
    </>
  );
}
