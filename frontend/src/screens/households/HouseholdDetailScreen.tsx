import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import type { ApiError } from "../../api/appFetch";
import type { Block } from "../../api/block";
import {
  changeHouseholdAdmin,
  deleteHousehold,
  getHousehold,
  getHouseholdMembers,
  getUserHouseholds,
  Household,
  HouseholdUser,
  removeHouseholdMember,
} from "../../api/households/householdService";
import { getAuthenticatedUser } from "../../api/users/userService";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import HouseholdMemberActionsSheet from "../../components/households/HouseholdMemberActionsSheet";
import HouseholdMemberItem from "../../components/households/HouseholdMemberItem";
import { useHouseholdStore } from "../../store/householdStore";
import { THEME } from "../../theme/theme";

type Props = {
  householdId: number;
  navigation?: {
    goBack?: () => void;
    navigate?: (screen: string, params?: any) => void;
  };
};

const GENERIC_HOUSEHOLD_IMAGE =
  "https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&w=240&q=80";

export default function HouseholdDetailScreen({ householdId, navigation }: Props) {
  const { t } = useTranslation();
  const currentHouseholdId = useHouseholdStore((s) => s.currentHouseholdId);
  const setCurrentHouseholdId = useHouseholdStore((s) => s.setCurrentHouseholdId);
  const clearCurrentHouseholdId = useHouseholdStore((s) => s.clearCurrentHouseholdId);

  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdUser[]>([]);
  const [page, setPage] = useState(0);
  const [hasMoreMembers, setHasMoreMembers] = useState(false);
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<HouseholdUser | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [memberActionErrors, setMemberActionErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);
  const householdNameLength = household?.name?.trim().length ?? 0;
  const householdNameStyle =
    householdNameLength > 30
      ? styles.householdNameSmall
      : householdNameLength > 18
      ? styles.householdNameMedium
      : styles.householdName;

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

  const loadFirstData = useCallback(() => {
    setLoadingFirst(true);
    setGlobalErrors([]);
    setLoadingMore(false);
    setPage(0);

    const errors: string[] = [];

    Promise.all([
      getAuthenticatedUser().then((user) => {
        setCurrentUserId(user?.id ?? null);
      }),
      getHousehold(
        householdId,
        (householdData) => {
          setHousehold(householdData);
        },
        (err: ApiError) => {
          errors.push(...extractErrorMessages(err));
        }
      ),
      getHouseholdMembers(
        householdId,
        0,
        (block: Block<HouseholdUser>) => {
          setMembers(block.items);
          setHasMoreMembers(block.existMoreItems);
        },
        (err: ApiError) => {
          errors.push(...extractErrorMessages(err));
        }
      ),
    ]).finally(() => {
      if (errors.length > 0) {
        setGlobalErrors(Array.from(new Set(errors)));
      }
      setLoadingFirst(false);
    });
  }, [householdId, t]);

  const loadMoreMembers = useCallback(() => {
    if (loadingFirst || loadingMore || !hasMoreMembers) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    getHouseholdMembers(
      householdId,
      nextPage,
      (block: Block<HouseholdUser>) => {
        setMembers((prev) => [...prev, ...block.items]);
        setHasMoreMembers(block.existMoreItems);
        setPage(nextPage);
        setGlobalErrors([]);
      },
      (err: ApiError) => {
        setGlobalErrors(extractErrorMessages(err));
      }
    ).finally(() => {
      setLoadingMore(false);
    });
  }, [hasMoreMembers, householdId, loadingFirst, loadingMore, page]);

  useFocusEffect(
    useCallback(() => {
      loadFirstData();
    }, [loadFirstData])
  );

  const isCurrentUserAdmin = currentUserId !== null && household?.adminId === currentUserId;
  const isSelectedHousehold = currentHouseholdId === householdId;

  const onEditHousehold = () => {
    if (!household) return;
    navigation?.navigate?.("UpdateHousehold", { household });
  };

  const onSetAsCurrentHousehold = () => {
    setCurrentHouseholdId(householdId);
  };

  const canManageMember = (member: HouseholdUser) =>
    Boolean(isCurrentUserAdmin && currentUserId !== null && member.userId !== currentUserId);

  const onOpenMemberActions = (member: HouseholdUser) => {
    if (!canManageMember(member)) return;
    setMemberActionErrors([]);
    setSelectedMember(member);
  };

  const onCloseMemberActions = () => {
    if (memberActionLoading) return;
    setSelectedMember(null);
    setMemberActionErrors([]);
  };

  const onMakeAdmin = async () => {
    if (!selectedMember) return;
    setMemberActionLoading(true);
    setMemberActionErrors([]);

    await changeHouseholdAdmin(
      householdId,
      selectedMember.userId,
      async () => {
        onCloseMemberActions();
        loadFirstData();
      },
      (err: ApiError) => {
        setMemberActionErrors(extractErrorMessages(err));
      }
    );

    setMemberActionLoading(false);
  };

  const onRemoveMember = async () => {
    if (!selectedMember) return;
    setMemberActionLoading(true);
    setMemberActionErrors([]);

    await removeHouseholdMember(
      householdId,
      selectedMember.userId,
      async () => {
        onCloseMemberActions();
        loadFirstData();
      },
      (err: ApiError) => {
        setMemberActionErrors(extractErrorMessages(err));
      }
    );

    setMemberActionLoading(false);
  };

  const onDeleteHousehold = async () => {
    setDeleteLoading(true);
    setDeleteErrors([]);

    await deleteHousehold(
      householdId,
      async () => {
        setShowDeleteConfirm(false);
        if (currentHouseholdId === householdId) {
          await getUserHouseholds(0, (block) => {
            if (block.items.length > 0) {
              setCurrentHouseholdId(block.items[0].id);
            } else {
              clearCurrentHouseholdId();
            }
          });
        }
        navigation?.goBack?.();
      },
      (err: ApiError) => {
        setDeleteErrors(extractErrorMessages(err));
      }
    );

    setDeleteLoading(false);
  };

  if (loadingFirst) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={THEME.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation?.goBack?.()}
            style={styles.backBtn}
            hitSlop={10}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color={THEME.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t("household.detail.title")}</Text>
          {isCurrentUserAdmin ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={onEditHousehold}
                style={styles.editBtn}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t("household.detail.edit")}
              >
                <MaterialCommunityIcons name="pencil-outline" size={24} color={THEME.text} />
              </Pressable>
              <Pressable
                onPress={() => setShowDeleteConfirm(true)}
                style={styles.editBtn}
                hitSlop={10}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#B91C1C" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <FlatList
          data={members}
          keyExtractor={(item) => String(item.userId)}
          renderItem={({ item }) => (
            <HouseholdMemberItem
              member={item}
              onPress={canManageMember(item) ? () => onOpenMemberActions(item) : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreMembers}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={
            <>
              <View style={styles.householdSection}>
                <View style={styles.imageWrap}>
                  {!imageError ? (
                    <Image
                      source={{ uri: GENERIC_HOUSEHOLD_IMAGE }}
                      style={styles.householdImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View style={styles.imageFallback}>
                      <MaterialCommunityIcons name="home-variant" size={34} color="#64748B" />
                    </View>
                  )}
                </View>

              <View style={styles.householdTextWrap}>
                  <Text style={householdNameStyle}>
                    {household?.name ?? "-"}
                  </Text>
                  <Text style={styles.householdDescription} numberOfLines={3}>
                    {household?.description || t("household.detail.subtitle")}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={onSetAsCurrentHousehold}
                disabled={isSelectedHousehold}
                style={({ pressed }) => [
                  styles.currentHouseholdBtn,
                  isSelectedHousehold && styles.currentHouseholdBtnSelected,
                  pressed && !isSelectedHousehold && styles.currentHouseholdBtnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isSelectedHousehold
                    ? t("household.detail.currentSelected")
                    : t("household.detail.setAsCurrent")
                }
              >
                <MaterialCommunityIcons
                  name={isSelectedHousehold ? "check-circle" : "home-switch-outline"}
                  size={20}
                  color={isSelectedHousehold ? "#1E7A4D" : "#102218"}
                />
                <Text
                  style={[
                    styles.currentHouseholdBtnText,
                    isSelectedHousehold && styles.currentHouseholdBtnTextSelected,
                  ]}
                >
                  {isSelectedHousehold
                    ? t("household.detail.currentSelected")
                    : t("household.detail.setAsCurrent")}
                </Text>
              </Pressable>

              {globalErrors.length > 0 ? (
                <View style={styles.errorWrap}>
                  <GlobalErrorBox messages={globalErrors} />
                  <Pressable style={styles.retryBtn} onPress={loadFirstData}>
                    <Text style={styles.retryBtnText}>{t("common.retry")}</Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t("household.detail.membersTitle")}</Text>
              </View>
            </>
          }
          ListFooterComponent={
            <>
              {loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={THEME.primary} />
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t("household.detail.membersEmpty")}</Text>
            </View>
          }
        />

        <View style={styles.bottomAction}>
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [styles.inviteBtn, pressed && styles.inviteBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t("households.generateInviteLink")}
          >
            <MaterialCommunityIcons name="link-variant" size={22} color="#102218" />
            <Text style={styles.inviteBtnText}>{t("households.generateInviteLink")}</Text>
          </Pressable>

        </View>

        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => !deleteLoading && setShowDeleteConfirm(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => !deleteLoading && setShowDeleteConfirm(false)}
          >
            <Pressable style={styles.modalBox} onPress={() => {}}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons name="home-remove-outline" size={36} color="#B91C1C" />
              </View>
              <Text style={styles.modalTitle}>{t("household.detail.deleteConfirmTitle")}</Text>
              <Text style={styles.modalMessage}>{t("household.detail.deleteConfirmMessage")}</Text>

              {deleteErrors.length > 0 && (
                <View style={styles.modalErrorWrap}>
                  <GlobalErrorBox messages={deleteErrors} />
                </View>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  style={({ pressed }) => [styles.modalCancelBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.modalCancelText}>{t("household.memberActions.cancel")}</Text>
                </Pressable>
                <Pressable
                  onPress={onDeleteHousehold}
                  disabled={deleteLoading}
                  style={({ pressed }) => [
                    styles.modalDeleteBtn,
                    deleteLoading && { opacity: 0.6 },
                    pressed && !deleteLoading && { opacity: 0.85 },
                  ]}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalDeleteText}>{t("household.memberActions.confirm")}</Text>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <HouseholdMemberActionsSheet
          visible={!!selectedMember}
          member={selectedMember}
          loading={memberActionLoading}
          errors={memberActionErrors}
          onClose={onCloseMemberActions}
          onMakeAdmin={onMakeAdmin}
          onRemoveMember={onRemoveMember}
        />
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
    backgroundColor: THEME.bg,
  },
  header: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.bg,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: THEME.text,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 132,
    gap: 12,
  },
  householdSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
  },
  imageWrap: {
    width: 104,
    height: 104,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#B6F0CF",
    overflow: "hidden",
    backgroundColor: THEME.surface,
  },
  householdImage: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3F7",
  },
  householdTextWrap: {
    flex: 1,
  },
  householdName: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: THEME.text,
  },
  householdNameMedium: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: THEME.text,
  },
  householdNameSmall: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: THEME.text,
  },
  householdDescription: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 32,
    color: "#566B86",
    fontWeight: "500",
  },
  errorWrap: {
    marginTop: 8,
    marginBottom: 2,
  },
  currentHouseholdBtn: {
    marginTop: 16,
    marginBottom: 4,
    alignSelf: "flex-start",
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#2BEE7C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#2BEE7C",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  currentHouseholdBtnSelected: {
    backgroundColor: "#E7F8EE",
    borderWidth: 1,
    borderColor: "#B7E6C7",
    shadowOpacity: 0,
  },
  currentHouseholdBtnPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  currentHouseholdBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#102218",
  },
  currentHouseholdBtnTextSelected: {
    color: "#1E7A4D",
  },
  retryBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: THEME.mint,
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryBtnText: {
    color: "#1E7A4D",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.text,
  },
  footerLoading: {
    paddingVertical: 12,
  },
  inviteBtn: {
    marginTop: 10,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2BEE7C",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#2BEE7C",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  inviteBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  inviteBtnText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#102218",
  },
  bottomAction: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    backgroundColor: THEME.bg,
    gap: 8,
  },
  deleteBtn: {
    height: 48,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B91C1C",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalBox: {
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
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: THEME.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 4,
  },
  modalErrorWrap: {
    width: "100%",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: THEME.border,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontWeight: "700",
    fontSize: 15,
    color: THEME.text,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: "#B91C1C",
    alignItems: "center",
    justifyContent: "center",
  },
  modalDeleteText: {
    fontWeight: "900",
    fontSize: 15,
    color: "#fff",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 14,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.muted,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: THEME.muted,
    fontSize: 14,
    fontWeight: "600",
  },
});
