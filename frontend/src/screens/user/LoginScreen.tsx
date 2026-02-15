import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { InputLabel } from "../../components/users/InputLabel";
import { FormLabel } from "../../components/FormLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { login } from "../../api/users/userService";
import type { ApiError } from "../../api/appFetch";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type LoginErrors = Partial<{
  username: string;
  password: string;
}>;

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): LoginErrors => {
    const e: LoginErrors = {};

    if (!username.trim()) e.username = t("genericErrors.requiredField");
    else if (username.trim().length > 50) e.username = t("genericErrors.max", { max: 50 });

    if (!password) e.password = t("genericErrors.requiredField");
    else if (password.length > 100) e.password = t("genericErrors.max", { max: 100 });

    return e;
  };

  const clearError = (key: keyof LoginErrors) => {
    if (!errors[key]) return;
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async () => {
    const e = validate();
    setErrors(e);
    setGlobalErrors([]);

    if (Object.keys(e).length > 0 || submitting) return;

    setSubmitting(true);

    await login(
      {
        userName: username.trim(),
        password,
      },
      (auth) => {
        console.log(`Login correcto para ${auth.user.userName}`);
      },
      (err: ApiError) => {
        setGlobalErrors(err.globalErrors ?? [t("login.failed")]);
      }
    );

    setSubmitting(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Ionicons name="restaurant" size={30} color="#2bee7c" />
        </View>

        <Text style={styles.title}>{t("login.title")}</Text>
        <Text style={styles.subtitle}>{t("login.subtitle")}</Text>

        {globalErrors.length > 0 ? (
          <View style={styles.globalErrorWrap}>
            <GlobalErrorBox messages={globalErrors} />
          </View>
        ) : null}

        <FormLabel text={t("login.username")} />
        <InputLabel
          leftIcon="at"
          placeholder={t("login.usernamePlaceholder")}
          autoCapitalize="none"
          value={username}
          onChangeText={(v) => {
            setUsername(v);
            clearError("username");
            if (globalErrors.length) setGlobalErrors([]);
          }}
          returnKeyType="next"
          errorText={errors.username}
        />

        <FormLabel text={t("login.password")} />
        <InputLabel
          leftIcon="lock-closed"
          rightIcon={showPassword ? "eye-off" : "eye"}
          onRightIconPress={() => setShowPassword((v) => !v)}
          placeholder={t("login.passwordPlaceholder")}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearError("password");
            if (globalErrors.length) setGlobalErrors([]);
          }}
          returnKeyType="done"
          errorText={errors.password}
        />

        <PrimaryButton text={t("login.submit")} onPress={onSubmit} disabled={submitting} />

        <View style={styles.switchWrap}>
          <Text style={styles.switchText}>{t("login.noAccount")}</Text>
          <Pressable onPress={() => navigation.navigate("Register")} hitSlop={8}>
            <Text style={styles.switchLink}>{t("login.goToRegister")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f8f7" },
  content: { paddingHorizontal: 18, paddingTop: 34, paddingBottom: 34, maxWidth: 420, alignSelf: "center" },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(43,238,124,0.18)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0d1b13",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3d8f66",
    textAlign: "center",
    marginBottom: 30,
  },
  globalErrorWrap: {
    marginBottom: 14,
  },
  switchWrap: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  switchText: {
    color: "#486356",
    fontSize: 14,
    fontWeight: "600",
  },
  switchLink: {
    color: "#1f8f55",
    fontSize: 14,
    fontWeight: "800",
  },
});
