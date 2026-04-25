import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  getProductDetail,
  updateProduct,
  type ProductNutriScoreGrade,
  type ProductNovaGroup,
  type ProductUnit,
} from "../../api/products/productService";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { FormLabel } from "../../components/FormLabel";
import {
  DropdownField,
  InfoFieldLabel,
  NOVA_COLORS,
  NOVA_SELECTED_COLORS,
  NUTRI_COLORS,
  NUTRI_SELECTED_COLORS,
  OptionalBooleanField,
  parseNonNegativeDecimal,
  PRICE_LIMIT,
  QUANTITY_LIMIT,
  styles as sharedStyles,
  type NutriScore,
  type NovaGroup,
  type ProductUnit as SharedProductUnit,
} from "./AddProductShared";

type Props = NativeStackScreenProps<AuthStackParamList, "EditProduct">;

const NUTRI_GRADES: NutriScore[] = ["A", "B", "C", "D", "E"];
const NOVA_GROUPS: NovaGroup[] = ["GROUP_1", "GROUP_2", "GROUP_3", "GROUP_4"];

export default function EditProductScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { productId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<SharedProductUnit>("UNIT");
  const [isVegetarian, setIsVegetarian] = useState<boolean | null>(null);
  const [isVegan, setIsVegan] = useState<boolean | null>(null);
  const [nutriScore, setNutriScore] = useState<NutriScore | null>(null);
  const [novaGroup, setNovaGroup] = useState<NovaGroup | null>(null);
  const [daysAfterOpening, setDaysAfterOpening] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{ name?: string; quantity?: string; defaultPrice?: string }>({});

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setLoadErrors([]);
      getProductDetail(
        productId,
        (data) => {
          setName(data.name ?? "");
          setBrand(data.brand ?? "");
          setDefaultPrice(data.defaultPrice ?? "");
          setQuantity(data.quantity ?? "");
          setUnit((data.unit as SharedProductUnit) ?? "UNIT");
          setIsVegetarian(data.isVegetarian ?? null);
          setIsVegan(data.isVegan ?? null);
          setNutriScore((data.nutriScoreGrade as NutriScore) ?? null);
          setNovaGroup((data.novaGroup as NovaGroup) ?? null);
          setDaysAfterOpening(data.daysAfterOpening != null ? String(data.daysAfterOpening) : "");
          setLoading(false);
        },
        (err) => {
          setLoadErrors(err.globalErrors ?? [t("products.detail.loadError")]);
          setLoading(false);
        }
      );
    }, [productId])
  );

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!name.trim()) errors.name = t("genericErrors.requiredField");

    if (quantity.trim()) {
      const q = parseNonNegativeDecimal(quantity);
      if (isNaN(q)) errors.quantity = t("addProduct.errors.invalidDecimal");
      else if (q > QUANTITY_LIMIT) errors.quantity = t("addProduct.errors.maxQuantity");
    } else {
      errors.quantity = t("genericErrors.requiredField");
    }

    if (defaultPrice.trim()) {
      const p = parseNonNegativeDecimal(defaultPrice);
      if (isNaN(p)) errors.defaultPrice = t("addProduct.errors.invalidDecimal");
      else if (p > PRICE_LIMIT) errors.defaultPrice = t("addProduct.errors.maxDecimal");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setSaveErrors([]);

    const daysVal = daysAfterOpening.trim() ? parseInt(daysAfterOpening.trim(), 10) : null;

    updateProduct(
      productId,
      {
        name: name.trim(),
        brand: brand.trim() || null,
        defaultPrice: defaultPrice.trim() || null,
        quantity: quantity.trim(),
        unit: unit as ProductUnit,
        isVegetarian: isVegetarian ?? null,
        isVegan: isVegan ?? null,
        nutriScoreGrade: nutriScore as ProductNutriScoreGrade ?? null,
        novaGroup: novaGroup ? (`GROUP_${NOVA_GROUPS.indexOf(novaGroup) + 1}` as ProductNovaGroup) : null,
        daysAfterOpening: daysVal,
      },
      () => {
        setSaving(false);
        navigation.goBack();
      },
      (err) => {
        setSaving(false);
        setSaveErrors(err.globalErrors ?? [t("editProduct.saveFailed")]);
      }
    );
  };

  const unitOptions: Array<{ label: string; value: SharedProductUnit }> = [
    { label: t("addProduct.units.g"), value: "G" },
    { label: t("addProduct.units.kg"), value: "KG" },
    { label: t("addProduct.units.ml"), value: "ML" },
    { label: t("addProduct.units.l"), value: "L" },
    { label: t("addProduct.units.unit"), value: "UNIT" },
  ];

  return (
    <SafeAreaView style={sharedStyles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={sharedStyles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={THEME.text} />
          </Pressable>
          <Text style={sharedStyles.headerTitle}>{t("editProduct.title")}</Text>
          <View style={sharedStyles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.primary} />
          </View>
        ) : loadErrors.length > 0 ? (
          <View style={{ margin: 20 }}>
            <GlobalErrorBox messages={loadErrors} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={sharedStyles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {saveErrors.length > 0 ? <GlobalErrorBox messages={saveErrors} /> : null}

          {/* Name */}
          <FormLabel text={t("addProduct.fields.productNameRequired")} />
          <TextInput
            style={[styles.input, fieldErrors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder={t("addProduct.placeholders.productName")}
            placeholderTextColor={THEME.muted}
            maxLength={80}
          />
          {fieldErrors.name ? <Text style={styles.errorText}>{fieldErrors.name}</Text> : null}

          {/* Brand */}
          <FormLabel text={t("addProduct.fields.brand")} />
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder={t("addProduct.placeholders.brand")}
            placeholderTextColor={THEME.muted}
          />

          {/* Quantity + Unit */}
          <View style={sharedStyles.rowFields}>
            <View style={sharedStyles.rowFieldLeft}>
              <FormLabel text={t("addProduct.fields.quantityRequired")} />
              <TextInput
                style={[styles.input, fieldErrors.quantity ? styles.inputError : null]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder={t("addProduct.placeholders.decimal")}
                placeholderTextColor={THEME.muted}
                keyboardType="decimal-pad"
              />
              {fieldErrors.quantity ? <Text style={styles.errorText}>{fieldErrors.quantity}</Text> : null}
            </View>
            <View style={sharedStyles.rowFieldRight}>
              <DropdownField
                label={t("addProduct.fields.unitRequired")}
                options={unitOptions}
                value={unit}
                onChange={setUnit}
              />
            </View>
          </View>

          {/* Default price */}
          <FormLabel text={t("addProduct.fields.defaultPrice")} />
          <TextInput
            style={[styles.input, fieldErrors.defaultPrice ? styles.inputError : null]}
            value={defaultPrice}
            onChangeText={setDefaultPrice}
            placeholder={t("addProduct.placeholders.decimal")}
            placeholderTextColor={THEME.muted}
            keyboardType="decimal-pad"
          />
          {fieldErrors.defaultPrice ? <Text style={styles.errorText}>{fieldErrors.defaultPrice}</Text> : null}

          {/* Days after opening */}
          <FormLabel text={t("addProduct.fields.daysAfterOpening")} />
          <TextInput
            style={styles.input}
            value={daysAfterOpening}
            onChangeText={setDaysAfterOpening}
            placeholder={t("addProduct.placeholders.daysAfterOpening")}
            placeholderTextColor={THEME.muted}
            keyboardType="number-pad"
          />

          {/* Vegetarian / Vegan */}
          <OptionalBooleanField
            label={t("addProduct.fields.vegetarian")}
            icon="leaf"
            yesText={t("addProduct.common.yes")}
            noText={t("addProduct.common.no")}
            value={isVegetarian}
            onChange={setIsVegetarian}
          />
          <OptionalBooleanField
            label={t("addProduct.fields.vegan")}
            icon="sprout"
            yesText={t("addProduct.common.yes")}
            noText={t("addProduct.common.no")}
            value={isVegan}
            onChange={setIsVegan}
          />

          {/* NutriScore */}
          <InfoFieldLabel
            text={t("addProduct.fields.nutriScore")}
            onPress={() => Alert.alert(t("addProduct.help.nutriScore.title"), t("addProduct.help.nutriScore.description"))}
            style={sharedStyles.nutriInfoLabel}
          />
          <View style={sharedStyles.gradeRow}>
            {NUTRI_GRADES.map((g) => {
              const selected = nutriScore === g;
              return (
                <Pressable
                  key={g}
                  style={[
                    sharedStyles.gradePill,
                    { backgroundColor: selected ? NUTRI_SELECTED_COLORS[g] : NUTRI_COLORS[g] },
                    selected ? sharedStyles.gradePillSelected : sharedStyles.gradePillDim,
                  ]}
                  onPress={() => setNutriScore(nutriScore === g ? null : g)}
                >
                  <Text style={[sharedStyles.gradePillText, !selected && sharedStyles.gradePillTextDim]}>{g}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* NOVA */}
          <InfoFieldLabel
            text={t("addProduct.fields.novaGroup")}
            onPress={() => Alert.alert(t("addProduct.help.novaGroup.title"), t("addProduct.help.novaGroup.description"))}
          />
          <View style={sharedStyles.gradeRow}>
            {NOVA_GROUPS.map((g) => {
              const selected = novaGroup === g;
              const num = g.replace("GROUP_", "");
              return (
                <Pressable
                  key={g}
                  style={[
                    sharedStyles.gradePill,
                    { backgroundColor: selected ? NOVA_SELECTED_COLORS[g] : NOVA_COLORS[g] },
                    selected ? sharedStyles.gradePillSelected : sharedStyles.gradePillDim,
                  ]}
                  onPress={() => setNovaGroup(novaGroup === g ? null : g)}
                >
                  <Text style={[sharedStyles.gradePillText, !selected && sharedStyles.gradePillTextDim]}>{num}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{t("editProduct.save")}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={sharedStyles.cancelBtn}>
            <Text style={sharedStyles.cancelText}>{t("addProduct.actions.cancel")}</Text>
          </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 54,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#F8FCFA",
    paddingHorizontal: 18,
    fontSize: 16,
    color: THEME.text,
    marginBottom: 12,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 6,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
