import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { uploadUserAvatar } from "../../api/users/userService";
import { THEME } from "../../theme/theme";
import { PrimaryButton } from "../../components/PrimaryButton";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "ProfilePhoto">;

const AVATAR_SIZE = 164;

export default function ProfilePhotoScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("profilePhoto.permissionTitle"), t("profilePhoto.permissionMessage"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLocalUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("profilePhoto.permissionTitle"), t("profilePhoto.permissionMessage"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLocalUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!localUri) {
      navigation.replace("Home");
      return;
    }
    setUploading(true);
    await uploadUserAvatar(
      localUri,
      () => {
        setUploading(false);
        navigation.replace("Home");
      },
      () => {
        setUploading(false);
        Alert.alert(t("profilePhoto.uploadError"));
        navigation.replace("Home");
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRingOuter}>
            <View style={styles.avatarRingInner}>
              {localUri ? (
                <Image source={{ uri: localUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={80} color={THEME.primary} />
                </View>
              )}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.cameraBadge, pressed && { opacity: 0.75 }]}
            onPress={pickImage}
          >
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Título */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t("profilePhoto.title")}</Text>
          <Text style={styles.subtitle}>{t("profilePhoto.subtitle")}</Text>
        </View>

        {/* Opciones */}
        <View style={styles.optionCard}>
          <Pressable
            style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
            onPress={takePhoto}
          >
            <View style={styles.optionIconWrap}>
              <MaterialCommunityIcons name="camera-outline" size={22} color={THEME.primary} />
            </View>
            <Text style={styles.optionText}>{t("profilePhoto.takePhoto")}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.muted} />
          </Pressable>

          <View style={styles.separator} />

          <Pressable
            style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
            onPress={pickImage}
          >
            <View style={styles.optionIconWrap}>
              <MaterialCommunityIcons name="image-multiple-outline" size={22} color={THEME.primary} />
            </View>
            <Text style={styles.optionText}>{t("profilePhoto.choosePhoto")}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={THEME.muted} />
          </Pressable>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsArea}>
          {uploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator color={THEME.primary} />
              <Text style={styles.uploadingText}>{t("profilePhoto.uploading")}</Text>
            </View>
          ) : (
            <>
              {localUri && (
                <PrimaryButton
                  text={t("profilePhoto.continue")}
                  onPress={handleContinue}
                />
              )}
              <Pressable onPress={() => navigation.replace("Home")} hitSlop={12} style={styles.skipLink}>
                <Text style={styles.skipText}>{t("profilePhoto.skip")}</Text>
              </Pressable>
            </>
          )}
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },

  /* Avatar */
  avatarSection: {
    marginBottom: 32,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingOuter: {
    width: AVATAR_SIZE + 16,
    height: AVATAR_SIZE + 16,
    borderRadius: (AVATAR_SIZE + 16) / 2,
    backgroundColor: THEME.mint2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRingInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: THEME.surface,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarPlaceholder: {
    flex: 1,
    backgroundColor: THEME.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: THEME.bg,
  },

  /* Texto */
  textBlock: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: THEME.muted,
    textAlign: "center",
    lineHeight: 21,
  },

  /* Opciones */
  optionCard: {
    width: "100%",
    backgroundColor: THEME.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 32,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  optionRowPressed: {
    backgroundColor: THEME.mint,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.mint2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: THEME.text,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.border,
    marginLeft: 72,
  },

  /* Acciones */
  actionsArea: {
    width: "100%",
    gap: 14,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadingText: {
    fontSize: 15,
    color: THEME.muted,
    fontWeight: "600",
  },
  skipLink: {
    paddingVertical: 4,
    alignSelf: "center",
  },
  skipText: {
    fontSize: 14,
    color: THEME.muted,
    fontWeight: "600",
  },
});
