import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserHouseholdListItem } from "../../api/households/householdService";
import { Pressable, StyleSheet, View, Text, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";


type Props = {
  item: UserHouseholdListItem;
  onPress: (householdId: number) => void;
};

export default function MyHouseholdsItemCard({item, onPress}: Props) {
    
    const { t } = useTranslation();
    const [failedAvatarUris, setFailedAvatarUris] = useState<Set<string>>(new Set());

    const avatars = item.membersAvatar ?? [];
    const showMore = item.hasMore;
    const membersCountKey =
        item.membersNumber === 1
            ? "households.membersCount_one"
            : "households.membersCount_other";

    return (
        <Pressable
            onPress={() => onPress(item.id)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            
            <View style={styles.content}>
                <View style={styles.left}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.name}
                    </Text>

                <View style={styles.badge}>
                    <MaterialCommunityIcons name="account" size={16} color="#1E7A4D" />
                    <Text style={styles.badgeText}>
                        {t(membersCountKey, { count: item.membersNumber })}
                    </Text>
                </View>

                <View style={styles.avatarsRow}>
                    {avatars.map((uri, idx) => (
                    <View
                        key={`${uri ?? "avatar"}-${idx}`}
                        style={[
                        styles.avatarWrap,
                        { marginLeft: idx === 0 ? 0 : -10 },
                        ]}
                    >
                        {uri && !failedAvatarUris.has(uri) ? (
                            <Image
                                source={{ uri }}
                                style={styles.avatar}
                                onError={() => {
                                    setFailedAvatarUris((prev) => {
                                        const next = new Set(prev);
                                        next.add(uri);
                                        return next;
                                    });
                                }}
                            />
                        ) : (
                            <View style={styles.fallbackAvatar}>
                                <MaterialCommunityIcons name="account-circle" size={24} color="#8A94A6" />
                            </View>
                        )}
                    </View>
                    ))}

                    {showMore && (
                        <View
                            style={[
                            styles.moreWrap,
                            { marginLeft: avatars.length === 0 ? 0 : -10 },
                            ]}
                        >
                            <Text style={styles.moreText}>+1</Text>
                        </View>
                    )}
                    </View>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={24} color="#AAB4C5" />
            </View>
            <View style={styles.rightAccent} />
        </Pressable>
    );
}

const AVATAR_SIZE = 34;
const AVATAR_OVERLAP = 10;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.92,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1220",
    marginBottom: 10,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF9F0",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E7A4D",
  },
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
  },
  fallbackAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#EEF1F6",
    alignItems: "center",
    justifyContent: "center",
  },
  moreWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#EAF9F0",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -AVATAR_OVERLAP,
  },
  moreText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E7A4D",
  },
  rightAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: "#2BE36F",
    opacity: 0.75,
  },
});
