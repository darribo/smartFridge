import { useTranslation } from "react-i18next";
import { HouseholdUser } from "../../api/households/householdService";
import { THEME } from "../../theme/theme";
import { View, Text, StyleSheet, Pressable } from "react-native";
import UserAvatar from "../users/UserAvatar";


type Props = {
    member: HouseholdUser;
    onPress?: () => void;
}

export default function HouseholdMemberItem({ member, onPress }: Props) {
    
    const { t } = useTranslation();
    
    const isAdmin = member.isAdmin;

    return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, onPress && pressed && styles.cardPressed]}
    >
      <View style={styles.left}>
        <View style={isAdmin ? styles.avatarWrapAdmin : styles.avatarWrap}>
          <UserAvatar
            avatar={member.userAvatar}
            size={AVATAR}
            borderColor={isAdmin ? "#6EE7B7" : THEME.border}
            borderWidth={2}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {member.userFullName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {member.userEmail}
          </Text>
        </View>
      </View>

      <View style={[styles.badge, isAdmin ? styles.badgeAdmin : styles.badgeMember]}>
        <Text style={[styles.badgeText, isAdmin ? styles.badgeTextAdmin : styles.badgeTextMember]}>
          {isAdmin ? t("household.member.admin") : t("household.member.member")}
        </Text>
      </View>
    </Pressable>
  );
}



const AVATAR = 50;

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  avatarWrap: {
    borderRadius: AVATAR / 2,
    overflow: "hidden",
  },
  avatarWrapAdmin: {
    borderRadius: AVATAR / 2,
    overflow: "hidden",
  },
  textWrap: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.text,
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: THEME.muted,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeAdmin: {
    backgroundColor: "#EAF9F0",
    borderColor: "#86EFAC",
  },
  badgeMember: {
    backgroundColor: "#F3F6FA",
    borderColor: "#D9E2EE",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  badgeTextAdmin: {
    color: "#16A34A",
  },
  badgeTextMember: {
    color: "#334155",
  },
});
