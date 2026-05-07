import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Modal,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { HouseholdUser } from "../../api/households/householdService";
import { GlobalErrorBox } from "../common/GlobalErrorBox";
import { THEME } from "../../theme/theme";
import { resolveImage } from "../../utils/image";

type Props = {
  visible: boolean;
  member: HouseholdUser | null;
  loading: boolean;
  errors: string[];
  onClose: () => void;
  onMakeAdmin: () => void;
  onRemoveMember: () => void;
};

export default function HouseholdMemberActionsSheet({
  visible,
  member,
  loading,
  errors,
  onClose,
  onMakeAdmin,
  onRemoveMember,
}: Props) {
  const { t } = useTranslation();

  const askMakeAdminConfirmation = () => {
    Alert.alert(
      t("household.memberActions.confirmMakeAdminTitle"),
      t("household.memberActions.confirmMakeAdminMessage"),
      [
        { text: t("household.memberActions.cancel"), style: "cancel" },
        {
          text: t("household.memberActions.confirm"),
          style: "default",
          onPress: onMakeAdmin,
        },
      ]
    );
  };

  const askRemoveMemberConfirmation = () => {
    Alert.alert(
      t("household.memberActions.confirmRemoveTitle"),
      t("household.memberActions.confirmRemoveMessage"),
      [
        { text: t("household.memberActions.cancel"), style: "cancel" },
        {
          text: t("household.memberActions.confirm"),
          style: "destructive",
          onPress: onRemoveMember,
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {member ? (
            <>
              <View style={styles.memberInfoRow}>
                <View style={styles.memberAvatarWrap}>
                  {member.userAvatar && member.userAvatar !== "placeholder" ? (
                    <Image source={{ uri: resolveImage(false, member.userAvatar) }} style={styles.memberAvatar} />
                  ) : (
                    <View style={styles.memberAvatarFallback}>
                      <MaterialCommunityIcons name="account" size={30} color="#64748B" />
                    </View>
                  )}
                </View>

                <View style={styles.memberTextWrap}>
                  <Text style={styles.memberName}>{member.userFullName}</Text>
                  <Text style={styles.memberEmail}>{member.userEmail}</Text>
                </View>
              </View>

              {errors.length > 0 ? (
                <View style={styles.memberErrorWrap}>
                  <GlobalErrorBox messages={errors} />
                </View>
              ) : null}

              <Pressable
                onPress={askMakeAdminConfirmation}
                disabled={loading}
                style={({ pressed }) => [
                  styles.sheetPrimaryBtn,
                  pressed && styles.sheetBtnPressed,
                  loading && styles.sheetBtnDisabled,
                ]}
              >
                <Text style={styles.sheetPrimaryBtnText}>{t("household.memberActions.makeAdmin")}</Text>
              </Pressable>

              <Pressable
                onPress={askRemoveMemberConfirmation}
                disabled={loading}
                style={({ pressed }) => [
                  styles.sheetDangerBtn,
                  pressed && styles.sheetBtnPressed,
                  loading && styles.sheetBtnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#B91C1C" />
                ) : (
                  <Text style={styles.sheetDangerBtnText}>{t("household.memberActions.removeMember")}</Text>
                )}
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
  },
  sheet: {
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 54,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginBottom: 14,
  },
  memberInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  memberAvatarWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: "#EEF3F7",
  },
  memberAvatar: {
    width: "100%",
    height: "100%",
  },
  memberAvatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  memberTextWrap: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
  },
  memberEmail: {
    marginTop: 3,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },
  memberErrorWrap: {
    marginBottom: 10,
  },
  sheetPrimaryBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sheetPrimaryBtnText: {
    color: "#15803D",
    fontSize: 16,
    fontWeight: "900",
  },
  sheetDangerBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDangerBtnText: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "900",
  },
  sheetBtnPressed: {
    opacity: 0.92,
  },
  sheetBtnDisabled: {
    opacity: 0.6,
  },
});
