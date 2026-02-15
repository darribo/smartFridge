import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { THEME } from "../../theme/theme";
import { iconFor, tintFor } from "./allergyVisuals";

type Props = {
  name: string;
  description: string;
  iconKey: string;
  checked: boolean;
  onPress: () => void; //Abre el detalle de cada alergia
  onToggle: () => void; // Marca y desmarca
};

export default function AllergyCard({
  name,
  description,
  iconKey,
  checked,
  onPress,
  onToggle,
}: Props) {
  const tint = tintFor(iconKey);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        checked && styles.cardSelected,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {/* Icono */}
      <View style={[styles.iconWrap, { backgroundColor: tint.bg }]}>
        <MaterialCommunityIcons
          name={iconFor(iconKey)}
          size={22}
          color={tint.fg}
        />
      </View>

      {/* Texto */}
      <View style={styles.cardText}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {description}
        </Text>
      </View>

      {/* Checkbox */}
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={[styles.checkOuter, checked && styles.checkOuterOn]}
      >
        {checked && (
          <View style={styles.checkInner}>
            <MaterialCommunityIcons name="check" size={16} color="#fff" />
          </View>
        )}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardSelected: {
    borderColor: THEME.primary,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: { flex: 1, paddingRight: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.muted,
  },
  checkOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#CFE7D7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOuterOn: {
    borderColor: THEME.primary,
  },
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});