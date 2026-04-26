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

  const handleSkip = () => {
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("profilePhoto.title")}</Text>
          <Text style={styles.subtitle}>{t("profilePhoto.subtitle")}</Text>
        </View>

        <Pressable style={styles.avatarContainer} onPress={pickImage}>
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account-circle" size={80} color={THEME.muted} />
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <MaterialCommunityIcons name="camera" size={20} color="#fff" />
          </View>
        </Pressable>

        <View style={styles.pickerButtons}>
          <Pressable
            style={({ pressed }) => [styles.pickerBtn, pressed && styles.pickerBtnPressed]}
            onPress={pickImage}
          >
            <MaterialCommunityIcons name="image-outline" size={20} color={THEME.primary} />
            <Text style={styles.pickerBtnText}>{t("profilePhoto.choosePhoto")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.pickerBtn, pressed && styles.pickerBtnPressed]}
            onPress={takePhoto}
          >
            <MaterialCommunityIcons name="camera-outline" size={20} color={THEME.primary} />
            <Text style={styles.pickerBtnText}>{t("profilePhoto.takePhoto")}</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          {uploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator color={THEME.primary} />
              <Text style={styles.uploadingText}>{t("profilePhoto.uploading")}</Text>
            </View>
          ) : (
            <PrimaryButton
              text={localUri ? t("profilePhoto.continue") : t("profilePhoto.skip")}
              onPress={handleContinue}
            />
          )}

          {!uploading && localUri && (
            <Pressable style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>{t("profilePhoto.skip")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 140;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: THEME.text,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: THEME.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginBottom: 28,
    position: "relative",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: THEME.mint2,
    borderWidth: 2,
    borderColor: THEME.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: THEME.bg,
  },
  pickerButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  pickerBtnPressed: {
    opacity: 0.75,
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
  },
  actions: {
    width: "100%",
    alignItems: "center",
    gap: 12,
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
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 14,
    color: THEME.muted,
    fontWeight: "600",
  },
});
