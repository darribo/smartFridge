import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { FormLabel } from "../../components/FormLabel";
import { InputLabel } from "../../components/users/InputLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { createProduct, uploadProductImage } from "../../api/products/productService";
import type { BarcodeProduct } from "../../api/products/productService";
import { THEME } from "../../theme/theme";
import {
  DropdownField,
  InfoFieldLabel,
  InfoCardKey,
  normalizeUnit,
  NOVA_COLORS,
  NOVA_SELECTED_COLORS,
  NovaGroup,
  NUTRI_COLORS,
  NUTRI_SELECTED_COLORS,
  NutriScore,
  OptionalBooleanField,
  parseNonNegativeDecimal,
  ProductFormErrors,
  PRODUCT_NAME_MAX_LENGTH,
  ProductUnit,
  QUANTITY_LIMIT,
  PRICE_LIMIT,
  styles,
  ExistingProduct,
} from "./AddProductShared";
import { GENERIC_PRODUCT_IMAGE, resolveProductImage } from "../../utils/image";

import * as ImagePicker from "expo-image-picker";


type Props = {
  householdId: number;
  barcodeProduct?: BarcodeProduct;
  onCreated: (product: ExistingProduct) => void;
};

export default function FirstTimeProductForm({ householdId, barcodeProduct, onCreated }: Props) {
  //Se hace la gestión completa del alta inicial de producto con datos precargados opcionales.
  const { t } = useTranslation();

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
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewLoading, setImagePreviewLoading] = useState(false);
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

  const isLocalImage = (value?: string | null) => !!value && value.startsWith("file://");

  const imageForCreatePayload = (value?: string | null) => {
    //Se hace la preparación del campo image para createProduct: si es local se envía null y luego se sube por multipart.
    if (!value) return null;
    if (isLocalImage(value)) return null;
    return value;
  };

  const handlePickImage = async () => {
    //Se hace la petición de permisos para acceder a la galería del dispositivo.
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t("addProduct.imagePicker.permissionTitle"),
        t("addProduct.imagePicker.permissionMessage")
      );
      return;
    }

    //Se hace la apertura de la galería para que el usuario pueda elegir una imagen.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    //Se hace la salida sin tocar el estado para conservar la imagen anterior si el usuario cancela.
    if (result.canceled) {
      return;
    }

    const selectedAsset = result.assets?.[0];
    if (!selectedAsset?.uri) {
      return;
    }

    //Se hace la sustitución de la imagen actual por la nueva imagen local elegida.
    setImage(selectedAsset.uri);
    setImagePreviewLoading(true);
  };

  useEffect(() => {
    //Se hace la precarga desde barcodeProduct cuando viene un producto externo sin id local.
    if (!barcodeProduct || barcodeProduct.id !== null) {
      return;
    }

    setBarcode(barcodeProduct.barcode ?? "");
    setName(barcodeProduct.name ?? "");
    setBrand(barcodeProduct.brand ?? "");
    setImage(barcodeProduct.image ?? null);
    setDefaultPrice(barcodeProduct.defaultPrice != null ? String(barcodeProduct.defaultPrice) : "");
    setQuantity(barcodeProduct.quantity != null ? String(barcodeProduct.quantity) : "");
    setUnit(normalizeUnit(barcodeProduct.unit ?? null));
    setVegetarian(barcodeProduct.vegetarian ?? null);
    setVegan(barcodeProduct.vegan ?? null);
    setNutriScoreGrade((barcodeProduct.nutriScoreGrade as NutriScore | null) ?? null);
    setNovaGroup((barcodeProduct.novaGroup as NovaGroup | null) ?? null);
    setGlobalErrors([]);
  }, [barcodeProduct]);

  useEffect(() => {
    //Se hace el control visual de carga cada vez que cambia la imagen visible del formulario.
    setImagePreviewLoading(Boolean(image));
  }, [image]);

  const isFirstFlowValid = useMemo(() => {
    //Se hace una validación mínima para habilitar el botón principal.
    return name.trim().length > 0 && quantity.trim().length > 0;
  }, [name, quantity]);

  const validateFirstFlow = (): ProductFormErrors => {
    //Se hace la validación completa del formulario de alta.
    const next: ProductFormErrors = {};

    if (!name.trim()) next.name = t("genericErrors.requiredField");
    else if (name.trim().length > PRODUCT_NAME_MAX_LENGTH) {
      next.name = t("genericErrors.max", { max: PRODUCT_NAME_MAX_LENGTH });
    }

    if (!quantity.trim()) {
      next.quantity = t("genericErrors.requiredField");
    } else {
      const parsedQuantity = parseNonNegativeDecimal(quantity);
      if (Number.isNaN(parsedQuantity)) next.quantity = t("addProduct.errors.invalidDecimal");
      else if (parsedQuantity > QUANTITY_LIMIT) next.quantity = t("addProduct.errors.maxQuantity");
    }

    if (defaultPrice.trim()) {
      const parsedDefaultPrice = parseNonNegativeDecimal(defaultPrice);
      if (Number.isNaN(parsedDefaultPrice)) next.defaultPrice = t("addProduct.errors.invalidDecimal");
      else if (parsedDefaultPrice > PRICE_LIMIT) next.defaultPrice = t("addProduct.errors.maxDecimal");
    }

    return next;
  };

  const onSubmit = async () => {
    //Se hace la creación del producto y, si la imagen es local, su subida posterior.
    if (submitting) return;

    const nextErrors = validateFirstFlow();
    setErrors(nextErrors);
    setGlobalErrors([]);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    const product = {
      barcode: barcode.trim() || null,
      name: name.trim(),
      image: imageForCreatePayload(image),
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
      async (createdProduct) => {
        let finalImage = createdProduct.image ?? null;

        if (isLocalImage(image)) {
          setUploadingImage(true);
          await uploadProductImage(
            createdProduct.id,
            image!,
            (updatedProduct) => {
              finalImage = updatedProduct.image ?? finalImage;
            },
            (err) => {
              setGlobalErrors(err.globalErrors ?? [t("addProduct.errors.imageUploadFailed")]);
            }
          );
          setUploadingImage(false);
        }

        onCreated({
          id: createdProduct.id,
          barcode: createdProduct.barcode ?? "",
          name: createdProduct.name,
          image: finalImage,
          defaultPrice: createdProduct.defaultPrice ?? null,
        });
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
    setUploadingImage(false);
  };

  return (
    <>
      {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

      <Pressable
        style={[styles.imageUploadBox, image ? styles.imageUploadBoxFilled : null]}
        onPress={handlePickImage}
      >
        {image ? (
          <>
            <Image
              source={{ uri: resolveProductImage(image) }}
              style={styles.imagePreview}
              resizeMode="contain"
              onLoadStart={() => setImagePreviewLoading(true)}
              onLoadEnd={() => setImagePreviewLoading(false)}
              onError={() => setImagePreviewLoading(false)}
            />
            {imagePreviewLoading ? (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.imageLoadingText}>{t("addProduct.status.loadingImage")}</Text>
              </View>
            ) : null}
            <View style={styles.imageOverlay}>
              <MaterialCommunityIcons name="camera-plus" size={22} color="#FFFFFF" />
              <Text style={styles.imageOverlayText}>{t("addProduct.imageSelected")}</Text>
            </View>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="camera-plus" size={34} color={THEME.primary} />
            <Text style={styles.imageUploadText}>{t("addProduct.addImage")}</Text>
          </>
        )}
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
        maxLength={PRODUCT_NAME_MAX_LENGTH}
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
            maxLength={8}
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
        <Text style={styles.moreInfoText}>{t("addProduct.moreInfo.subtitle")}</Text>

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
        onPress={onSubmit}
        disabled={submitting || !isFirstFlowValid}
      />

      {submitting ? (
        <View style={styles.submitStatusRow}>
          <ActivityIndicator size="small" color={THEME.primary} />
          <Text style={styles.submitStatusText}>
            {uploadingImage
              ? t("addProduct.status.uploadingImage")
              : t("addProduct.status.savingProduct")}
          </Text>
        </View>
      ) : null}

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
    </>
  );
}
