

import React, { useState } from "react";
import { getUserHouseholds, UserHouseholdListItem } from "../../api/households/householdService";
import MyHouseholdsItemCard from "../../components/households/MyHouseholdsItem";
import {THEME} from "../../theme/theme";
import { ApiError } from "../../api/appFetch";
import { Block } from "../../api/block";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, Text, ActivityIndicator, FlatList, Pressable } from "react-native";
import { t } from "i18next";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { useFocusEffect } from "@react-navigation/native";


type Props = NativeStackScreenProps<AuthStackParamList, "MyHouseholds">;

export default function MyHouseholdsScreen({navigation}: Props){

    const [households, setHouseholds] = useState<UserHouseholdListItem[]>([]);
    const [page, setPage] = useState(0);
    const [loadingFirst, setLoadingFirst] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
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

    const loadFirstPage = () => {
        setLoadingFirst(true);
        setGlobalErrors([]);

        getUserHouseholds(
            0,
            (block: Block<UserHouseholdListItem>) => {
                setHouseholds(block.items);
                setHasMore(block.existMoreItems);
                setPage(0);
                setLoadingFirst(false);
            },
            (err: ApiError) => {
                setGlobalErrors(extractErrorMessages(err));
                setLoadingFirst(false);
            }
        )
    };

    const loadMore = () => {
        if (loadingFirst || loadingMore || !hasMore) return;

        const nextPage = page + 1;
        setLoadingMore(true);

        getUserHouseholds(
        nextPage,
        (block: Block<UserHouseholdListItem>) => {
            setHouseholds((prev) => [...prev, ...block.items]);
            setHasMore(block.existMoreItems);
            setPage(nextPage);
            setGlobalErrors([]);
            setLoadingMore(false);
        },
        (err: ApiError) => {
            setGlobalErrors(extractErrorMessages(err));
            setLoadingMore(false);
        }
        );
    };

    useFocusEffect(
        React.useCallback(() => {
            loadFirstPage();
        }, [])
    );

    const onOpenHousehold = (householdId: number) => {
        navigation.navigate("HouseholdDetail", { householdId });
    };

    const onCreateHousehold = () => {
        navigation.navigate("CreateHousehold");
    };

    const renderItem = ({ item }: { item: UserHouseholdListItem }) => (
        <MyHouseholdsItemCard item={item} onPress={onOpenHousehold} />
    );

    return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        {/* Header (sin campanita) */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("households.list.title")}</Text>
          <Text style={styles.headerSubtitle}>{t("households.list.subtitle")}</Text>
        </View>

        {/* Error global (si quieres) */}
        {globalErrors.length > 0 && (
          <View style={styles.errorWrap}>
            <GlobalErrorBox messages={globalErrors} />
          </View>
        )}

        {/* Lista scrolleable */}
        {loadingFirst ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={households}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.6}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{t("households.list.empty")}</Text>
              </View>
            }
          />
        )}

        {/* FAB fijo abajo derecha */}
        <Pressable
          onPress={onCreateHousehold}
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.98 }] }]}
          accessibilityRole="button"
          accessibilityLabel={t("households.list.actions.create")}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#0B1220" />
        </Pressable>
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
        paddingHorizontal: 16,
    },
    header: {
        paddingTop: 10,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: THEME.text,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        marginTop: 6,
        fontSize: 14,
        color: THEME.muted,
    },
    errorWrap: {
        marginBottom: 8,
    },
    listContent: {
        paddingTop: 6,
        paddingBottom: 120, //para que el FAB no tape el último item
        gap: 10,
    },
    footerLoading: {
        paddingVertical: 14,
    },
    empty: {
        paddingTop: 26,
        alignItems: "center",
    },
    emptyText: {
        color: THEME.muted,
        fontSize: 14,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    fab: {
        position: "absolute",
        right: 18,
        bottom: 18,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: THEME.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
});
