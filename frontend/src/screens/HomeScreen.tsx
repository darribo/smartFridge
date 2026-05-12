import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Modal,
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
import { countExpiringProducts, countLittleStockProducts, countPantryItems, getExpiringProducts } from "../api/products/productService";
import { generateAiRecipe } from "../api/recipes/recipeService";
import type { GenerateAiRecipeParams, NewRecipeParams } from "../api/recipes/recipeService";
import { logout } from "../api/users/userService";
import { GlobalErrorBox } from "../components/common/GlobalErrorBox";
import NoHouseholdModal from "../components/common/NoHouseholdModal";
import GenerateAiFiltersModal from "../components/recipes/GenerateAiFiltersModal";
import UserAvatar from "../components/users/UserAvatar";
import type { AuthStackParamList } from "../navigation/AuthStack";
import { useHouseholdStore } from "../store/householdStore";
import { useUserStore } from "../store/userStore";
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
  const clearCurrentHouseholdId = useHouseholdStore((s) => s.clearCurrentHouseholdId);
  const user = useUserStore((s) => s.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [households, setHouseholds] = useState<UserHouseholdListItem[]>([]);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [showNoHousehold, setShowNoHousehold] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loadingAiModal, setLoadingAiModal] = useState(false);
  const [aiModalInitialProducts, setAiModalInitialProducts] = useState<Array<{ id: number; name: string }>>([]);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [pantryItemsCount, setPantryItemsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

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

  const fetchHouseholdPage = (page: number) =>
    new Promise<Block<UserHouseholdListItem>>((resolve, reject) => {
      getUserHouseholds(
        page,
        (block: Block<UserHouseholdListItem>) => resolve(block),
        (err: ApiError) => reject(err)
      );
    });

  const loadHome = async () => {
    setLoadingFirst(true);
    setGlobalErrors([]);

    try {
      let page = 0;
      let hasMore = true;
      const allHouseholds: UserHouseholdListItem[] = [];

      while (hasMore) {
        const block = await fetchHouseholdPage(page);
        allHouseholds.push(...block.items);
        hasMore = block.existMoreItems;
        page += 1;
      }

      setHouseholds(allHouseholds);
    } catch (err) {
      if (err && typeof err === "object" && "globalErrors" in err) {
        setGlobalErrors(extractErrorMessages(err as ApiError));
      } else {
        setGlobalErrors([t("common.networkError")]);
      }
    } finally {
      setLoadingFirst(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHome();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!currentHouseholdId) return;
      countExpiringProducts(currentHouseholdId, (c) => setExpiringSoonCount(c), () => {});
      countPantryItems(currentHouseholdId, (c) => setPantryItemsCount(c), () => {});
      countLittleStockProducts(currentHouseholdId, (c) => setLowStockCount(c), () => {});
    }, [currentHouseholdId])
  );

  useEffect(() => {
    if (households.length === 0) {
      clearCurrentHouseholdId();
      return;
    }

    const householdStillExists = households.some(
      (household) => household.id === currentHouseholdId
    );

    if (!currentHouseholdId || !householdStillExists) {
      setCurrentHouseholdId(households[0].id);
    }
  }, [households, currentHouseholdId, setCurrentHouseholdId, clearCurrentHouseholdId]);

  const currentHousehold =
    households.find((household) => household.id === currentHouseholdId) ?? households[0] ?? null;
  const resolvedHouseholdId = currentHousehold?.id ?? null;
  const totalMembers = households.reduce((sum, household) => sum + household.membersNumber, 0);
  const heroMode: "expiring" | "lowStock" | "allGood" =
    expiringSoonCount > 0 ? "expiring" : lowStockCount > 0 ? "lowStock" : "allGood";

  const requireHousehold = (action: (id: number) => void) => {
    if (resolvedHouseholdId) {
      action(resolvedHouseholdId);
    } else {
      setShowNoHousehold(true);
    }
  };

  const openAiModal = () => {
    if (!resolvedHouseholdId) {
      setShowNoHousehold(true);
      return;
    }
    setAiModalInitialProducts([]);
    setShowAiModal(true);
  };

  const openAiModalWithExpiring = async () => {
    if (!resolvedHouseholdId) {
      setShowNoHousehold(true);
      return;
    }
    setLoadingAiModal(true);
    await getExpiringProducts(
      resolvedHouseholdId,
      0,
      (block) => {
        const seen = new Set<number>();
        const unique = block.items
          .filter((p) => { if (seen.has(p.productId)) return false; seen.add(p.productId); return true; })
          .map((p) => ({ id: p.productId, name: p.productName }));
        setAiModalInitialProducts(unique);
      },
      () => setAiModalInitialProducts([])
    );
    setLoadingAiModal(false);
    setShowAiModal(true);
  };

  const handleGenerateAi = async (params: GenerateAiRecipeParams) => {
    if (!resolvedHouseholdId) return;
    setShowAiModal(false);
    setGeneratingAi(true);
    await generateAiRecipe(
      resolvedHouseholdId,
      params,
      (recipe: NewRecipeParams) => {
        setGeneratingAi(false);
        navigation.navigate("AddRecipe", { householdId: resolvedHouseholdId, initialRecipe: recipe });
      },
      () => {
        setGeneratingAi(false);
        setGlobalErrors([t("addRecipe.ai.error")]);
      }
    );
  };

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
      <NoHouseholdModal
        visible={showNoHousehold}
        onClose={() => setShowNoHousehold(false)}
        onCreateHousehold={() => { setShowNoHousehold(false); navigation.navigate("CreateHousehold"); }}
        onGoToHouseholds={() => { setShowNoHousehold(false); navigation.navigate("MyHouseholds"); }}
      />
      <GenerateAiFiltersModal
        visible={showAiModal}
        householdId={resolvedHouseholdId ?? 0}
        initialProducts={aiModalInitialProducts}
        onGenerate={handleGenerateAi}
        onClose={() => setShowAiModal(false)}
      />
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerEyebrow}>{t("home.eyebrow")}</Text>
              <Text style={styles.headerTitle}>{currentHousehold?.name ?? t("home.titleFallback")}</Text>
              <Text style={styles.headerSubtitle}>
                {t("home.subtitle", { count: expiringSoonCount })}
              </Text>
            </View>
            <Pressable
              style={styles.headerAvatar}
              onPress={() => setShowProfileMenu(true)}
            >
              <UserAvatar avatar={user?.avatar} size={48} borderColor={THEME.border} borderWidth={2} />
            </Pressable>
          </View>

          {globalErrors.length > 0 ? <GlobalErrorBox messages={globalErrors} /> : null}

          <View style={styles.heroCard}>
            {heroMode !== "allGood" && (
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons
                  name={heroMode === "expiring" ? "clock-alert-outline" : "package-variant-minus"}
                  size={18}
                  color="#0B2817"
                />
                <Text style={styles.heroBadgeText}>
                  {t(heroMode === "expiring" ? "home.hero.badge" : "home.hero.badgeLowStock")}
                </Text>
              </View>
            )}
            <Text style={styles.heroTitle}>
              {heroMode === "expiring"
                ? t("home.hero.title", { count: expiringSoonCount })
                : heroMode === "lowStock"
                ? t("home.hero.titleLowStock", { count: lowStockCount })
                : t("home.hero.titleAllGood")}
            </Text>
            <Text style={styles.heroBody}>
              {t(heroMode === "expiring"
                ? "home.hero.body"
                : heroMode === "lowStock"
                ? "home.hero.bodyLowStock"
                : "home.hero.bodyAllGood")}
            </Text>
            <View style={styles.heroActions}>
              {heroMode !== "allGood" && (
                <Pressable
                  style={styles.heroGhostBtn}
                  onPress={() =>
                    heroMode === "lowStock"
                      ? requireHousehold((id) => navigation.navigate("AddProduct", { householdId: id }))
                      : navigation.navigate("ExpiringProducts")
                  }
                >
                  <MaterialCommunityIcons
                    name={heroMode === "expiring" ? "clock-alert-outline" : "plus"}
                    size={18}
                    color="#E8FFF1"
                  />
                  <Text style={styles.heroGhostBtnText}>
                    {t(heroMode === "expiring" ? "home.hero.secondaryExpiring" : "home.hero.secondaryLowStock")}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.heroPrimaryBtn, loadingAiModal && styles.heroPrimaryBtnDisabled]}
                disabled={loadingAiModal}
                onPress={() => {
                  if (heroMode === "allGood") openAiModal();
                  else if (heroMode === "expiring") openAiModalWithExpiring();
                  else navigation.navigate("ProductLocationSelector");
                }}
              >
                {loadingAiModal
                  ? <ActivityIndicator size="small" color="#0B2817" />
                  : heroMode === "expiring" && <MaterialCommunityIcons name="auto-fix" size={18} color="#0B2817" />
                }
                <Text style={styles.heroPrimaryBtnText}>
                  {t(heroMode === "allGood"
                    ? "home.hero.primaryAllGood"
                    : heroMode === "expiring"
                    ? "home.hero.primaryExpiring"
                    : "home.hero.primary")}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Pressable
              style={({ pressed }) => [styles.metricCard, pressed && styles.metricCardPressed, expiringSoonCount === 0 && styles.metricCardDisabled]}
              onPress={() => expiringSoonCount > 0 ? navigation.navigate("ExpiringProducts") : undefined}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: "#FFF3E5" }]}>
                <MaterialCommunityIcons name="clock-alert-outline" size={16} color="#C2670A" />
              </View>
              <Text style={styles.metricLabel}>{t("home.metrics.expiring")}</Text>
              <Text style={styles.metricValue}>{expiringSoonCount}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.metricCard, pressed && styles.metricCardPressed, pantryItemsCount === 0 && styles.metricCardDisabled]}
              onPress={() => pantryItemsCount > 0 ? navigation.navigate("ProductLocationSelector") : undefined}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: "#E9F7EE" }]}>
                <MaterialCommunityIcons name="archive-outline" size={16} color="#3A815F" />
              </View>
              <Text style={styles.metricLabel}>{t("home.metrics.items")}</Text>
              <Text style={styles.metricValue}>{pantryItemsCount}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.metricCard, pressed && styles.metricCardPressed, lowStockCount === 0 && styles.metricCardDisabled]}
              onPress={() => lowStockCount > 0 ? navigation.navigate("MyProducts", { storageFilter: "ALL" }) : undefined}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: "#F0EBFC" }]}>
                <MaterialCommunityIcons name="trending-down" size={16} color="#7B54C9" />
              </View>
              <Text style={styles.metricLabel}>{t("home.metrics.lowStock")}</Text>
              <Text style={styles.metricValue}>{lowStockCount}</Text>
            </Pressable>
          </View>

          {/* <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("home.quickActions.title")}</Text>
              <Text style={styles.sectionMeta}>{t("home.quickActions.subtitle")}</Text>
            </View>
            <View style={styles.quickGrid}>
              <QuickAction
                icon="qrcode-scan"
                label={t("home.quickActions.scan")}
                onPress={() =>
                  requireHousehold((id) => navigation.navigate("ScanProduct", { householdId: id }))
                }
                accent
              />
              <QuickAction
                icon="plus-box-outline"
                label={t("home.quickActions.add")}
                onPress={() =>
                  requireHousehold((id) => navigation.navigate("AddProduct", { householdId: id }))
                }
              />
              <QuickAction
                icon="fridge-outline"
                label={t("home.quickActions.pantry")}
                onPress={() => navigation.navigate("ProductLocationSelector")}
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
          </View> */}

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{t("home.ideas.title")}</Text>
              <Text style={styles.sectionMeta}>{t("home.ideas.subtitle")}</Text>
            </View>
            <View style={styles.recipeCard}>
              <View style={styles.recipeBadge}>
                <MaterialCommunityIcons name="auto-fix" size={14} color={THEME.primary} />
                <Text style={styles.recipeBadgeText}>{t("home.ideas.badge")}</Text>
              </View>
              <Text style={styles.recipeTitle}>{t("home.ideas.cardTitle")}</Text>
              <Text style={styles.recipeBody}>{t("home.ideas.cardBody")}</Text>
              <View style={styles.recipeActions}>
                <Pressable
                  style={({ pressed }) => [styles.recipeAiBtn, pressed && styles.recipeAiBtnPressed]}
                  onPress={openAiModal}
                >
                  <MaterialCommunityIcons name="auto-fix" size={18} color="#0B2817" />
                  <Text style={styles.recipeAiBtnText}>{t("home.ideas.btnAi")}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.recipeGhostBtn, pressed && styles.recipeGhostBtnPressed]}
                  onPress={() => navigation.navigate("MyRecipes")}
                >
                  <Text style={styles.recipeGhostBtnText}>{t("home.ideas.btnRecipes")}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <FooterItem icon="home-variant" label={t("home.footer.home")} active />
          <FooterItem
            icon="fridge-outline"
            label={t("home.footer.pantry")}
            onPress={() => {
              if (!resolvedHouseholdId) { setShowNoHousehold(true); return; }
              navigation.navigate("ProductLocationSelector");
            }}
          />
          <Pressable
            onPress={() =>
              requireHousehold((id) => navigation.navigate("ScanProduct", { householdId: id }))
            }
            style={styles.scanFab}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={28} color="#0B2817" />
          </Pressable>
          <FooterItem
            icon="silverware-fork-knife"
            label={t("home.footer.recipes")}
            onPress={() => navigation.navigate("MyRecipes")}
          />
          <FooterItem
            icon="cart-outline"
            label={t("home.footer.shopping")}
            onPress={() => {
              if (!resolvedHouseholdId) { setShowNoHousehold(true); return; }
              navigation.navigate("ShoppingList");
            }}
          />
        </View>
      </View>

      {generatingAi && (
        <View style={styles.aiOverlay}>
          <View style={styles.aiOverlayCard}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.aiOverlayText}>{t("addRecipe.ai.generating")}</Text>
          </View>
        </View>
      )}

      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setShowProfileMenu(false)}>
          <View style={styles.menuCard}>
            <View style={styles.menuAvatarRow}>
              <UserAvatar avatar={user?.avatar} size={52} borderColor={THEME.primary} borderWidth={2} />
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName} numberOfLines={1}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.menuUserEmail} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => { setShowProfileMenu(false); navigation.navigate("Profile"); }}
            >
              <MaterialCommunityIcons name="account-outline" size={22} color={THEME.text} />
              <Text style={styles.menuItemText}>{t("profileMenu.profile")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => { setShowProfileMenu(false); navigation.navigate("ChangePassword"); }}
            >
              <MaterialCommunityIcons name="lock-outline" size={22} color={THEME.text} />
              <Text style={styles.menuItemText}>{t("profileMenu.changePassword")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => { setShowProfileMenu(false); navigation.navigate("MyHouseholds"); }}
            >
              <MaterialCommunityIcons name="home-group" size={22} color={THEME.text} />
              <Text style={styles.menuItemText}>{t("profileMenu.myHouseholds")}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.muted} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={async () => {
                setShowProfileMenu(false);
                await logout();
                navigation.replace("Login");
              }}
            >
              <MaterialCommunityIcons name="logout" size={22} color="#B91C1C" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>{t("profileMenu.logout")}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  heroPrimaryBtnDisabled: {
    opacity: 0.6,
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
  metricCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  metricCardDisabled: {
    opacity: 0.45,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
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
    borderRadius: 28,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 20,
  },
  recipeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.mint2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  recipeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.primary,
  },
  recipeTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 8,
  },
  recipeBody: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.muted,
    marginBottom: 16,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 10,
  },
  recipeAiBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },
  recipeAiBtnPressed: {
    opacity: 0.85,
  },
  recipeAiBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0B2817",
  },
  recipeGhostBtn: {
    minHeight: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeGhostBtnPressed: {
    opacity: 0.7,
  },
  recipeGhostBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
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
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(14, 26, 19, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  aiOverlayCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: "center",
    gap: 14,
    shadowColor: THEME.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  aiOverlayText: { fontSize: 15, fontWeight: "600", color: THEME.text },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14,26,19,0.45)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 18,
  },
  menuCard: {
    width: 280,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  menuAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
  },
  menuUserEmail: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.muted,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: THEME.border,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemPressed: {
    backgroundColor: THEME.mint,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
  },
  menuItemTextDanger: {
    color: "#B91C1C",
  },
});
