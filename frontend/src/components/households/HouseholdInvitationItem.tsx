/* import { useTranslation } from "react-i18next";
import { HouseholdInvitation } from "../../api/households/householdService";
import { THEME } from "../../theme/theme";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  invitation: HouseholdInvitation;
  onCancel: (invitationId: number) => void;
};

export default function HouseholdInvitationItem({ invitation, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="email-outline" size={22} color="#64748B" />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.email} numberOfLines={1}>
          {invitation.guestEmail}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {invitation.sentAt}
        </Text>
      </View>

      <View style={styles.badgePending}>
        <Text style={styles.badgePendingText}>{t("household.invitation.pending")}</Text>
      </View>

      <Pressable
        onPress={() => onCancel(invitation.id)}
        hitSlop={10}
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel={t("household.invitation.cancel")}
      >
        <MaterialCommunityIcons name="close" size={18} color="#94A3B8" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: THEME.surface,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  email: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
  },
  meta: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "600",
    color: THEME.muted,
  },
  badgePending: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    marginRight: 10,
  },
  badgePendingText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#F59E0B",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
}); */