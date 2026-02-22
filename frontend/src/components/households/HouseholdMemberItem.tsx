import { useTranslation } from "react-i18next";
import { HouseholdUser } from "../../api/households/householdService";
import { THEME } from "../../theme/theme";
import { View, Text, Image, StyleSheet } from "react-native";


type Props = {
    member: HouseholdUser;
}

export default function HouseholdMemberItem({ member }: Props) {
    
    const { t } = useTranslation();
    
    const isAdmin = member.isAdmin;

    return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={[styles.avatarWrap, isAdmin && styles.avatarWrapAdmin]}>
          {member.userAvatar ? (
            <Image source={{ uri: member.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback} />
          )}
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
    </View>
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
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: THEME.mint,
  },
  avatarWrapAdmin: {
    borderColor: "#6EE7B7", //un verde suave para resaltar admin
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: THEME.mint2,
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
