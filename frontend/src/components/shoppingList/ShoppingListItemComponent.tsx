import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import type { ShoppingListItem } from "../../api/shoppingList/shoppingListService";
import { FallbackImage } from "../common/FallbackImage";
import { THEME } from "../../theme/theme";

type Props = {
  item: ShoppingListItem;
  onToggle: (itemId: number) => void;
  onRemove: (itemId: number) => void;
  onUpdateCount: (itemId: number, newCount: number) => void;
  disabled?: boolean;
};

export default function ShoppingListItemComponent({ item, onToggle, onRemove, onUpdateCount, disabled }: Props) {
  const { t } = useTranslation();

  const name = item.productName ?? item.customProductName ?? "—";
  const brand = item.customProductBrand;
  const hasImage = Boolean(item.productImage);

  const addedByText =
    item.addedByNames.length > 0
      ? t("shoppingList.addedBy", { names: item.addedByNames.join(", ") })
      : null;

  const checkedByText =
    item.checked && item.checkedByName
      ? t("shoppingList.checkedBy", { name: item.checkedByName })
      : null;

  return (
    <View style={[styles.row, item.checked && styles.rowChecked]}>
      <Pressable
        onPress={() => !disabled && onToggle(item.id)}
        style={styles.checkbox}
        hitSlop={8}
      >
        <MaterialCommunityIcons
          name={item.checked ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
          size={26}
          color={item.checked ? THEME.primary : THEME.muted}
        />
      </Pressable>

      {hasImage ? (
        <FallbackImage
          image={item.productImage}
          iconName="package-variant"
          iconSize={20}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <MaterialCommunityIcons
            name={item.productId ? "package-variant" : "pencil-outline"}
            size={20}
            color={THEME.muted}
          />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, item.checked && styles.nameChecked]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {item.autoAdded && (
            <MaterialCommunityIcons name="star" size={13} color="#F59E0B" style={styles.starIcon} />
          )}
        </View>

        {brand ? (
          <Text style={styles.sub} numberOfLines={1}>
            {brand}
          </Text>
        ) : null}

        {item.itemCount != null && item.itemCount > 1 ? (
          <Text style={styles.sub}>× {item.itemCount}</Text>
        ) : null}

        {item.autoAdded && !item.checked ? (
          <Text style={styles.autoTag}>{t("shoppingList.autoAdded")}</Text>
        ) : null}

        {checkedByText ? (
          <Text style={styles.checkedByText}>{checkedByText}</Text>
        ) : addedByText ? (
          <Text style={styles.addedByText} numberOfLines={1}>
            {addedByText}
          </Text>
        ) : null}
      </View>

      {!item.checked && (
        <View style={styles.stepper}>
          <Pressable
            hitSlop={8}
            style={styles.stepperBtn}
            onPress={() => !disabled && onUpdateCount(item.id, Math.max(1, (item.itemCount ?? 1) - 1))}
          >
            <MaterialCommunityIcons name="minus" size={14} color={THEME.text} />
          </Pressable>
          <Text style={styles.stepperCount}>{item.itemCount ?? 1}</Text>
          <Pressable
            hitSlop={8}
            style={styles.stepperBtn}
            onPress={() => !disabled && onUpdateCount(item.id, Math.min(99, (item.itemCount ?? 1) + 1))}
          >
            <MaterialCommunityIcons name="plus" size={14} color={THEME.text} />
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => !disabled && onRemove(item.id)}
        hitSlop={8}
        style={styles.deleteBtn}
      >
        <MaterialCommunityIcons name="close" size={18} color={THEME.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
  },
  rowChecked: {
    opacity: 0.6,
    backgroundColor: THEME.mint,
  },
  checkbox: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.mint2,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
    flexShrink: 1,
  },
  nameChecked: {
    textDecorationLine: "line-through",
    color: THEME.muted,
  },
  starIcon: {
    marginTop: 1,
  },
  sub: {
    fontSize: 13,
    color: THEME.muted,
  },
  autoTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#F59E0B",
    marginTop: 2,
  },
  addedByText: {
    fontSize: 11,
    color: THEME.muted,
    marginTop: 2,
  },
  checkedByText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: THEME.mint2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperCount: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
    minWidth: 18,
    textAlign: "center",
  },
  deleteBtn: {
    padding: 4,
  },
});
