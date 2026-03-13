import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { ApiError } from "../api/appFetch";
import { Block } from "../api/block";
import { getUserHouseholds, UserHouseholdListItem } from "../api/households/householdService";
import { GlobalErrorBox } from "../components/common/GlobalErrorBox";
import type { AuthStackParamList } from "../navigation/AuthStack";
import { useHouseholdStore } from "../store/householdStore";
import { THEME } from "../theme/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Home">;

type QuickActionProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
  accent?: boolean;
};

function QuickAction({ icon, label, onPress, accent = false }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        accent && styles.quickActionAccent,
        pressed && styles.quickActionPressed,
      ]}
    >
      <View style={[styles.quickActionIcon, accent && styles.quickActionIconAccent]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={accent ? "#0B2817" : THEME.primary}
        />
      </View>
      <Text style={[styles.quickActionText, accent && styles.quickActionTextAccent]}>{label}</Text>
    </Pressable>
  );
}

type FooterItemProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function FooterItem({ icon, label, active = false, onPress }: FooterItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.footerItem}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={active ? THEME.primary : "#7A8694"}
      />
      <Text style={[styles.footerText, active && styles.footerTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }: Props) {

  const { t } = useTranslation();
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);
  const setCurrentHouseholdId = useHouseholdStore((s) => s.setCurrentHouseholdId);
  const [households, setHouseholds] = useState<UserHouseholdListItem[]>([]);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const extractErrorMessages = (err: ApiError): string[] => {
    if (Array.isArray(err.globalErrors) && err.globalErrors.length > 0) {
      return err.globalErrors;
    }

    if (err.fieldErrors) {
      const fieldMessages = Object.values(err.fieldErrors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((message): message is string => Boolean(message));
      if (fieldMessages.length > 0) return fieldMessages;
    }

    return [t("common.networkError")];
  };

  const loadHome = () => {
    setLoadingFirst(true);
    setGlobalErrors([]);

    getUserHouseholds(
      0,
      (block: Block<UserHouseholdListItem>) => {
        setHouseholds(block.items);
        setLoadingFirst(false);
      },
      (err: ApiError) => {
        setGlobalErrors(extractErrorMessages(err));
        setLoadingFirst(false);
      }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHome();
    }, [])
  );

  useEffect(() => {
    if (households.length === 0) return;

    const householdStillExists = households.some(
      (household) => household.id === currentHouseholdId
    );

    if (!currentHouseholdId || !householdStillExists) {
      setCurrentHouseholdId(households[0].id);
    }
  }, [households, currentHouseholdId, setCurrentHouseholdId]);

  const currentHousehold =
    households.find((household) => household.id === currentHouseholdId) ?? households[0] ?? null;
  const resolvedHouseholdId = currentHousehold?.id ?? null;
  const totalMembers = households.reduce((sum, household) => sum + household.membersNumber, 0);
  const expiringSoon = currentHousehold ? Math.max(2, currentHousehold.membersNumber) : 3;
  const pantryItems = currentHousehold ? currentHousehold.membersNumber * 7 + 12 : 24;
  const lowStock = households.length > 0 ? Math.max(1, households.length - 1) : 2;

  if (loadingFirst) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerEyebrow}>{t("home.eyebrow")}</Text>
              <Text style={styles.headerTitle}>{currentHousehold?.name ?? t("home.titleFallback")}</Text>
              <Text style={styles.headerSubtitle}>
                {t("home.subtitle", { count: expiringSoon })}
              </Text>
            </View>
            <Pressable style={styles.headerAvatar}>
              <MaterialCommunityIcons name="fridge-outline" size={24} color="#0B2817" />
            </Pressable>
          </View>

          {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="clock-alert-outline" size={18} color="#0B2817" />
              <Text style={styles.heroBadgeText}>{t("home.hero.badge")}</Text>
            </View>
            <Text style={styles.heroTitle}>{t("home.hero.title", { count: expiringSoon })}</Text>
            <Text style={styles.heroBody}>{t("home.hero.body")}</Text>
            <View style={styles.heroActions}>
              <Pressable
                style={styles.heroPrimaryBtn}
                onPress={() =>
                  resolvedHouseholdId &&
                  navigation.navigate("HouseholdDetail", { householdId: resolvedHouseholdId })
                }
              >
                <Text style={styles.heroPrimaryBtnText}>{t("home.hero.primary")}</Text>
              </Pressable>
              <Pressable
                style={styles.heroGhostBtn}
                onPress={() =>
                  resolvedHouseholdId &&
                  navigation.navigate("ScanProduct", { householdId: resolvedHouseholdId })
                }
              >
                <MaterialCommunityIcons name="qrcode-scan" size={18} color="#E8FFF1" />
                <Text style={styles.heroGhostBtnText}>{t("home.hero.secondary")}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("home.metrics.expiring")}</Text>
              <Text style={styles.metricValue}>{expiringSoon}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("home.metrics.items")}</Text>
              <Text style={styles.metricValue}>{pantryItems}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{t("home.metrics.lowStock")}</Text>
              <Text style={styles.metricValue}>{lowStock}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("home.quickActions.title")}</Text>
              <Text style={styles.sectionMeta}>{t("home.quickActions.subtitle")}</Text>
            </View>
            <View style={styles.quickGrid}>
              <QuickAction
                icon="qrcode-scan"
                label={t("home.quickActions.scan")}
                onPress={() =>
                  resolvedHouseholdId &&
                  navigation.navigate("ScanProduct", { householdId: resolvedHouseholdId })
                }
                accent
              />
              <QuickAction
                icon="plus-box-outline"
                label={t("home.quickActions.add")}
                onPress={() =>
                  resolvedHouseholdId &&
                  navigation.navigate("AddProduct", { householdId: resolvedHouseholdId })
                }
              />
              <QuickAction
                icon="fridge-outline"
                label={t("home.quickActions.pantry")}
                onPress={() =>
                  resolvedHouseholdId &&
                  navigation.navigate("HouseholdDetail", { householdId: resolvedHouseholdId })
                }
              />
              <QuickAction
                icon="home-group-plus"
                label={t("home.quickActions.households")}
                onPress={() => navigation.navigate("MyHouseholds")}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("home.households.title")}</Text>
              <Text style={styles.sectionMeta}>{t("home.households.subtitle", { count: totalMembers })}</Text>
            </View>
            <View style={styles.householdList}>
              {households.slice(0, 3).map((household, index) => (
                <Pressable
                  key={household.id}
                  onPress={() => navigation.navigate("HouseholdDetail", { householdId: household.id })}
                  style={({ pressed }) => [styles.householdCard, pressed && styles.householdPressed]}
                >
                  <View style={styles.householdRank}>
                    <Text style={styles.householdRankText}>0{index + 1}</Text>
                  </View>
                  <View style={styles.householdTextBlock}>
                    <Text style={styles.householdName}>{household.name}</Text>
                    <Text style={styles.householdMeta}>
                      {t("home.households.members", { count: household.membersNumber })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#758391" />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("home.ideas.title")}</Text>
              <Text style={styles.sectionMeta}>{t("home.ideas.subtitle")}</Text>
            </View>
            <View style={styles.recipeCard}>
              <View style={styles.recipeIconWrap}>
                <MaterialCommunityIcons name="pot-steam-outline" size={24} color="#0B2817" />
              </View>
              <View style={styles.recipeTextBlock}>
                <Text style={styles.recipeTitle}>{t("home.ideas.cardTitle")}</Text>
                <Text style={styles.recipeBody}>{t("home.ideas.cardBody")}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <FooterItem icon="home-variant" label={t("home.footer.home")} active />
          <FooterItem
            icon="fridge-outline"
            label={t("home.footer.pantry")}
            onPress={() =>
              resolvedHouseholdId &&
              navigation.navigate("HouseholdDetail", { householdId: resolvedHouseholdId })
            }
          />
          <Pressable
            onPress={() =>
              resolvedHouseholdId &&
              navigation.navigate("ScanProduct", { householdId: resolvedHouseholdId })
            }
            style={styles.scanFab}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={28} color="#0B2817" />
          </Pressable>
          <FooterItem
            icon="home-group"
            label={t("home.footer.households")}
            onPress={() => navigation.navigate("MyHouseholds")}
          />
          <FooterItem icon="chart-box-outline" label={t("home.footer.stats")} />
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
  screen: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 126,
    gap: 18,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4F8A69",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: THEME.muted,
  },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#DDF4E7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C9E9D7",
  },
  heroCard: {
    backgroundColor: "#0F2E1C",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#08130D",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#BCECCF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B2817",
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#F6FFF9",
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#C7E6D3",
    marginBottom: 18,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroPrimaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  heroPrimaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B2817",
  },
  heroGhostBtn: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#315741",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroGhostBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E8FFF1",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCEDE3",
    padding: 16,
    minHeight: 108,
    justifyContent: "space-between",
  },
  metricLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: THEME.muted,
    fontWeight: "700",
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 30,
    color: THEME.text,
    fontWeight: "900",
  },
  section: {
    gap: 12,
  },
  sectionHead: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    color: THEME.text,
    letterSpacing: -0.3,
  },
  sectionMeta: {
    fontSize: 14,
    color: THEME.muted,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAction: {
    width: "48.4%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCEDE3",
    padding: 16,
    minHeight: 114,
    justifyContent: "space-between",
  },
  quickActionAccent: {
    backgroundColor: "#DDF4E7",
    borderColor: "#C7E9D4",
  },
  quickActionPressed: {
    transform: [{ scale: 0.985 }],
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#EDF8F1",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionIconAccent: {
    backgroundColor: "#F4FFF7",
  },
  quickActionText: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800",
    color: THEME.text,
  },
  quickActionTextAccent: {
    color: "#0B2817",
  },
  householdList: {
    gap: 10,
  },
  householdCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCEDE3",
    padding: 16,
  },
  householdPressed: {
    transform: [{ scale: 0.992 }],
  },
  householdRank: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#E9F7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  householdRankText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3A815F",
  },
  householdTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  householdName: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 2,
  },
  householdMeta: {
    fontSize: 14,
    color: THEME.muted,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 24,
    backgroundColor: "#FFFDF4",
    borderWidth: 1,
    borderColor: "#EFE7C2",
    padding: 16,
  },
  recipeIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#EEF7D2",
    alignItems: "center",
    justifyContent: "center",
  },
  recipeTextBlock: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 4,
  },
  recipeBody: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.muted,
  },
  footer: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    height: 82,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#D8ECE0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#101810",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  footerItem: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A8694",
  },
  footerTextActive: {
    color: THEME.primary,
  },
  scanFab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#22C55E",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});
