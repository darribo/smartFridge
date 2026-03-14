import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "ProductLocationSelector">;
type StorageFilter = "ALL" | "PANTRY" | "FRIDGE" | "FREEZER";

type Option = {
  value: StorageFilter;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  bg: string;
  label: string;
};

export default function ProductLocationSelectorScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const options: Option[] = [
    {
      value: "ALL",
      icon: "shape-outline",
      color: THEME.primary,
      bg: THEME.mint2,
      label: t("products.locationSelector.options.all"),
    },
    {
      value: "FRIDGE",
      icon: "fridge-outline",
      color: THEME.primary,
      bg: THEME.mint2,
      label: t("products.locationSelector.options.fridge"),
    },
    {
      value: "FREEZER",
      icon: "snowflake",
      color: THEME.muted,
      bg: THEME.mint,
      label: t("products.locationSelector.options.freezer"),
    },
    {
      value: "PANTRY",
      icon: "package-variant-closed",
      color: THEME.text,
      bg: THEME.mint,
      label: t("products.locationSelector.options.pantry"),
    },
  ];

  const onSelect = (storageFilter: StorageFilter) => {
    navigation.navigate("MyProducts", { storageFilter });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{t("products.locationSelector.title")}</Text>
              <Text style={styles.headerSubtitle}>{t("products.locationSelector.subtitle")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: option.bg }]}>
                <MaterialCommunityIcons name={option.icon} size={28} color={option.color} />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backBtn: {
    width: 36,
    height: 36,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: THEME.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  optionCard: {
    width: "47.8%",
    minHeight: 148,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  optionPressed: {
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.text,
    textAlign: "center",
  },
});
