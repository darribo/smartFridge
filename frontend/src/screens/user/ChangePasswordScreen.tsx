import React, { useState } from "react";
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
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { changePassword } from "../../api/users/userService";
import { THEME } from "../../theme/theme";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "ChangePassword">;

export default function ChangePasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = async () => {
    setErrors([]);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrors([t("genericErrors.requiredField")]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors([t("changePassword.mismatch")]);
      return;
    }
    if (newPassword.length < 8) {
      setErrors([t("genericErrors.min", { min: 8 })]);
      return;
    }

    setSaving(true);
    await changePassword(
      oldPassword,
      newPassword,
      () => {
        setSaving(false);
        Alert.alert(t("changePassword.saveSuccess"), undefined, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      },
      (err) => {
        setSaving(false);
        setErrors(err.globalErrors ?? [t("changePassword.saveError")]);
      }
    );
  };

  const PasswordField = ({
    label,
    value,
    onChangeText,
    placeholder,
    show,
    onToggleShow,
  }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    show: boolean;
    onToggleShow: () => void;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={THEME.muted}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <Pressable onPress={onToggleShow} style={styles.eyeBtn}>
          <MaterialCommunityIcons
            name={show ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={THEME.muted}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={THEME.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("changePassword.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {errors.length > 0 && <GlobalErrorBox messages={errors} />}

        <PasswordField
          label={t("changePassword.current")}
          value={oldPassword}
          onChangeText={setOldPassword}
          placeholder={t("changePassword.currentPlaceholder")}
          show={showOld}
          onToggleShow={() => setShowOld((v) => !v)}
        />
        <PasswordField
          label={t("changePassword.new")}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder={t("changePassword.newPlaceholder")}
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
        />
        <PasswordField
          label={t("changePassword.confirm")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder={t("changePassword.confirmPlaceholder")}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.85 },
            saving && { opacity: 0.6 },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#102218" />
          ) : (
            <Text style={styles.saveBtnText}>{t("changePassword.save")}</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    gap: 4,
  },
  fieldWrap: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.muted,
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: THEME.text,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    marginTop: 28,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#102218",
  },
});
