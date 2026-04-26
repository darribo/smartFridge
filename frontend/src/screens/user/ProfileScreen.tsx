import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { updateProfile, uploadUserAvatar } from "../../api/users/userService";
import { useUserStore } from "../../store/userStore";
import { THEME } from "../../theme/theme";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import UserAvatar from "../../components/users/UserAvatar";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("profile.permissionTitle"), t("profile.permissionMessage"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length) return;

    setUploadingAvatar(true);
    await uploadUserAvatar(
      result.assets[0].uri,
      () => setUploadingAvatar(false),
      () => {
        setUploadingAvatar(false);
        Alert.alert(t("profile.uploadError"));
      }
    );
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrors([t("genericErrors.requiredField")]);
      return;
    }
    setErrors([]);
    setSaving(true);
    await updateProfile(
      firstName.trim(),
      lastName.trim(),
      () => {
        setSaving(false);
        Alert.alert(t("profile.saveSuccess"));
      },
      (err) => {
        setSaving(false);
        setErrors(err.globalErrors ?? [t("profile.saveError")]);
      }
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <UserAvatar
              avatar={user?.avatar}
              size={AVATAR_SIZE}
              borderColor={user?.avatar && user.avatar !== "placeholder" ? THEME.primary : THEME.border}
              borderWidth={3}
            />
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </View>
          <Pressable
            onPress={pickAndUploadAvatar}
            disabled={uploadingAvatar}
            style={({ pressed }) => [styles.changePhotoBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialCommunityIcons name="camera-outline" size={16} color={THEME.primary} />
            <Text style={styles.changePhotoText}>{t("profile.changePhoto")}</Text>
          </Pressable>
        </View>

        {errors.length > 0 && <GlobalErrorBox messages={errors} />}

        <View style={styles.form}>
          <Text style={styles.label}>{t("profile.firstName")}</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("profile.firstNamePlaceholder")}
            placeholderTextColor={THEME.muted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>{t("profile.lastName")}</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("profile.lastNamePlaceholder")}
            placeholderTextColor={THEME.muted}
            autoCapitalize="words"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
        >
          {saving ? (
            <ActivityIndicator color="#102218" />
          ) : (
            <Text style={styles.saveBtnText}>{t("profile.save")}</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.changePasswordLink}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <MaterialCommunityIcons name="lock-outline" size={18} color={THEME.muted} />
          <Text style={styles.changePasswordText}>{t("profile.changePasswordLink")}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={THEME.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 100;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: THEME.text,
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    position: "relative",
    marginBottom: 12,
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
  },
  form: {
    gap: 6,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.muted,
    marginTop: 14,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: THEME.text,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    marginBottom: 16,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#102218",
  },
  changePasswordLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  changePasswordText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.muted,
  },
});
