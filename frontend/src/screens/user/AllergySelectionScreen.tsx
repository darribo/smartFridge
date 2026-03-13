import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { signUp } from "../../api/users/userService";

import { THEME } from "../../theme/theme";
import { Allergy, getAllergies } from "../../api/allergies/allergyService";
import { useTranslation } from "react-i18next";
import AllergyCard from "../../components/allergies/SelectAllergyItem";
import { PrimaryButton } from "../../components/PrimaryButton";
import { tintFor, iconFor } from "../../components/allergies/allergyVisuals";
import { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { ApiError } from "../../api/appFetch";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";

type Props = NativeStackScreenProps<AuthStackParamList, "Allergies">;

export default function AllergySelectionScreen({ route, navigation }: Props) {
  const { user } = route.params;

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detail, setDetail] = useState<Allergy | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listLoadError, setListLoadError] = useState(false);

  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const { t } = useTranslation();

  const allergyIds = useMemo(() => Array.from(selected.values()), [selected]);

  //Añade o quita las alergias
  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  //Función para registrarse con alergias
  const signUpWithAllergies = async () => {

    setGlobalErrors([]);

    const userWithAllergies = {
      allergyIds: allergyIds,
      ...user
    };

    await signUp(
      userWithAllergies,
      (auth) => {
        console.log(`Registrado el usuario con token ${auth.serviceToken}`);
        navigation.replace("Home");
      },
      (err: ApiError) => {
        const hasFieldErrors =
          !!err.fieldErrors && Object.keys(err.fieldErrors).length > 0;

        if (hasFieldErrors) {
          navigation.navigate("Register", { backendError: err });
          return;
        }

        setGlobalErrors(err.globalErrors ?? ["Error"]);
      }
    );
  }

  const loadNextPage = (reset = false) => {
    if (loading) return;
    if (!hasMore && !reset) return;

    setListLoadError(false);
    setLoading(true);

    const nextPage = reset ? 0 : page;

    getAllergies(
      nextPage,
      (block: { items: Allergy[]; existMoreItems: boolean | ((prevState: boolean) => boolean); }) => {
        setAllergies((prev) => (reset ? block.items : [...prev, ...block.items]));
        setHasMore(block.existMoreItems);
        setPage(nextPage + 1);
        setLoading(false);
      },
      (err: ApiError) => {
        setListLoadError(true);
        setLoading(false);
      }
    );
  };


  useEffect(() => {
    loadNextPage(true);
  }, []);


return (
  <SafeAreaView style={styles.safe}>
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backBtn,
              pressed && { opacity: 0.85 },
            ]}
            hitSlop={10}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color={THEME.text}
            />
          </Pressable>
      </View>

        <Text style={styles.title}>
          {t("allergy.title")}
        </Text>

        <Text style={styles.subtitle}>
          {t("allergy.subtitle")}
        </Text>

        {globalErrors.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <GlobalErrorBox messages={globalErrors} />
          </View>
        )}

      </View>

      {/* Lista de alergias */}
      <FlatList
        data={allergies}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <AllergyCard
            name={item.name}
            description={item.description}
            iconKey={item.icon}
            checked={selected.has(item.id)}
            onPress={() => setDetail(item)}
            onToggle={() => toggle(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => loadNextPage(false)}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={THEME.primary} />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          ) : listLoadError ? (
            <View style={styles.errorFooter}>
              <Text style={styles.errorFooterText}>{t("allergy.loadError")}</Text>
            </View>
          ) : null
        }
      />

      {/* Footer fijo */}
      <View style={styles.footer}>
        <PrimaryButton
          text={t("allergy.continue")}
          onPress={signUpWithAllergies}
          disabled={loading}
        />
      </View>

      {/* Modal detalle */}
      <Modal
        visible={!!detail}
        transparent
        animationType="fade"
        onRequestClose={() => setDetail(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDetail(null)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {detail && (
              <>
                <View style={styles.sheetHeader}>
                  <View
                    style={[
                      styles.sheetIcon,
                      { backgroundColor: tintFor(detail.icon).bg },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={iconFor(detail.icon)}
                      size={26}
                      color={tintFor(detail.icon).fg}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>
                      {detail.name}
                    </Text>
                    <Text style={styles.sheetHint}>
                      {t("allergy.detail")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sheetBody}>
                  {t("allergy.explanation", {
                    allergy: detail.name.toLowerCase(),
                  })}
                  {"\n\n"}
                  {detail.description}
                </Text>

                <PrimaryButton
                  text={t("common.understood")}
                  onPress={() => setDetail(null)}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  </SafeAreaView>
);

}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg },
  screen: { flex: 1, backgroundColor: THEME.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
  },
  stepWrap: { flex: 1, alignItems: "center" },
  stepText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: THEME.primary,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME.muted,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 170,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.06 : 0,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === "android" ? 1 : 0,
  },
  cardSelected: {
    borderColor: THEME.primary,
    backgroundColor: "#FFFFFF",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: { flex: 1, paddingRight: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: THEME.muted,
  },

  checkOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#CFE7D7",
    alignItems: "center",
    justifyContent: "center",
  },
  checkOuterOn: {
    borderColor: THEME.primary,
  },
  checkInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "rgba(245, 251, 247, 0.92)",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },

  noAllergies: {
    textAlign: "center",
    color: "#90A49A",
    fontWeight: "700",
    fontSize: 14,
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    color: THEME.muted,
  },
  errorFooter: {
    alignItems: "center",
    paddingVertical: 12,
  },
  errorFooterText: {
    color: "#B42318",
    fontWeight: "700",
    fontSize: 13,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheetWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: THEME.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: THEME.border,
  },
  sheetHandle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D8E8DF",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  sheetIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.text,
  },
  sheetHint: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.primary,
    marginTop: 2,
  },
  sheetBody: {
    fontSize: 14,
    lineHeight: 21,
    color: THEME.muted,
    marginBottom: 14,
  },
  sheetBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
