import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { THEME } from "../../theme/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreateHousehold: () => void;
  onGoToHouseholds: () => void;
};

export default function NoHouseholdModal({ visible, onClose, onCreateHousehold, onGoToHouseholds }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="home-alert-outline" size={36} color={THEME.primary} />
          </View>
          <Text style={styles.title}>{t("noHousehold.title")}</Text>
          <Text style={styles.message}>{t("noHousehold.message")}</Text>

          <Pressable
            onPress={onCreateHousehold}
            style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.88 }]}
          >
            <MaterialCommunityIcons name="home-plus-outline" size={20} color="#102218" />
            <Text style={styles.createBtnText}>{t("noHousehold.create")}</Text>
          </Pressable>

          <Pressable
            onPress={onGoToHouseholds}
            style={({ pressed }) => [styles.listBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.listBtnText}>{t("noHousehold.goToList")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  box: {
    width: "100%",
    backgroundColor: THEME.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: THEME.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 4,
  },
  createBtn: {
    marginTop: 8,
    width: "100%",
    height: 52,
    borderRadius: 999,
    backgroundColor: "#2BEE7C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2BEE7C",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#102218",
  },
  listBtn: {
    paddingVertical: 10,
  },
  listBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.muted,
    textDecorationLine: "underline",
  },
});
