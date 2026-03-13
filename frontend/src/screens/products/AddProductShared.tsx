import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { FormLabel } from "../../components/FormLabel";
import { THEME } from "../../theme/theme";

export type ProductUnit = "G" | "KG" | "ML" | "L" | "UNIT";
export type NutriScore = "A" | "B" | "C" | "D" | "E";
export type NovaGroup = "GROUP_1" | "GROUP_2" | "GROUP_3" | "GROUP_4";
export type ProductItemStorageLocation = "PANTRY" | "FRIDGE" | "FREEZER";

export type ExistingProduct = {
  id: number;
  barcode: string;
  name: string;
  image?: string | null;
  defaultPrice?: string | null;
};

export type ProductFormErrors = Partial<{
  name: string;
  quantity: string;
  defaultPrice: string;
  pricePaid: string;
  purchaseDate: string;
}>;

export type InfoCardKey = "nutriScore" | "novaGroup" | null;

export const PRICE_LIMIT = 999.99;
export const QUANTITY_LIMIT = 99999.99;

export const NUTRI_COLORS: Record<NutriScore, string> = {
  A: "#39D27A",
  B: "#D7E8BB",
  C: "#F1E5A7",
  D: "#EFC0B2",
  E: "#E8B5BA",
};

export const NUTRI_SELECTED_COLORS: Record<NutriScore, string> = {
  A: "#0FA958",
  B: "#AFCF7F",
  C: "#E3CE65",
  D: "#DE9C88",
  E: "#D6878E",
};

export const NOVA_COLORS: Record<NovaGroup, string> = {
  GROUP_1: "#6EE49A",
  GROUP_2: "#EFE2A9",
  GROUP_3: "#EDCFB0",
  GROUP_4: "#EAB7B7",
};

export const NOVA_SELECTED_COLORS: Record<NovaGroup, string> = {
  GROUP_1: "#2AC560",
  GROUP_2: "#D9C66B",
  GROUP_3: "#DFAE7E",
  GROUP_4: "#D38787",
};

export const toIsoDateTimeOrNull = (value: Date | null): string | null => {
  //Se hace la conversión de Date a string ISO sin hora real para enviarlo al backend.
  if (!value) return null;
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00`;
};

export const getTomorrowDate = () => {
  //Se hace el cálculo de la fecha de mañana para abrir el selector de caducidad en ese día.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const parseNonNegativeDecimal = (raw: string): number => {
  //Se hace la validación de decimal no negativo con hasta 2 decimales.
  const value = raw.trim();
  if (!value) return Number.NaN;
  const normalized = value.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return Number.NaN;
  return parsed;
};

export const normalizeUnit = (value?: string | null): ProductUnit => {
  //Se hace la normalización de unidad para mantener solo valores soportados.
  const allowedUnits: ProductUnit[] = ["G", "KG", "ML", "L", "UNIT"];
  if (value && allowedUnits.includes(value as ProductUnit)) {
    return value as ProductUnit;
  }
  return "ML";
};

type DropdownFieldProps<T extends string> = {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
};

export function DropdownField<T extends string>({
  label,
  options,
  value,
  onChange,
}: DropdownFieldProps<T>) {
  //Se hace la gestión local del desplegable para abrir, cerrar y seleccionar una opción.
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

export function OptionalBooleanField({
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
  //Se hace un selector ternario para booleanos opcionales: true, false o null.
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

export function InfoFieldLabel({
  text,
  onPress,
  style,
}: {
  text: string;
  onPress: () => void;
  style?: object;
}) {
  //Se hace la etiqueta con icono de ayuda para mostrar información contextual.
  return (
    <View style={[styles.infoLabelRow, style]}>
      <FormLabel text={text} />
      <Pressable onPress={onPress} hitSlop={10} style={styles.infoLabelBtn}>
        <MaterialCommunityIcons name="help-circle" size={20} color={THEME.muted} />
      </Pressable>
    </View>
  );
}

export const styles = StyleSheet.create({
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
    overflow: "hidden",
    position: "relative",
  },
  imageUploadBoxFilled: {
    borderStyle: "solid",
    borderColor: "#D7E2EF",
    backgroundColor: "#FFFFFF",
    padding: 0,
  },
  imageUploadText: {
    color: "#223348",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  imageOverlayText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.32)",
    gap: 8,
  },
  imageLoadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  submitStatusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitStatusText: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: "600",
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
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchResultImage: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#EEF3F7",
  },
  searchResultText: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "600",
    flexShrink: 1,
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
  selectedProductImageLayer: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  imagePreviewHidden: {
    opacity: 0,
  },
  selectedProductImageWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EEF3F7",
    position: "relative",
  },
  cardImageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
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
