import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { FormLabel } from "../../components/FormLabel";
import { useEffect, useState, } from "react";
import { Ionicons } from "@expo/vector-icons";
import { InputLabel } from "../../components/users/InputLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthStackParamList } from "../../navigation/AuthStack";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RegisterErrors = Partial<{ //Partial convierte todos los atributos en campos opcionales 
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen = ({ navigation, route }: Props) => {
    
    const { t } = useTranslation();

    const[showPassword, setShowPassword] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<RegisterErrors>({});

    const validate = (): RegisterErrors => {
        const e: RegisterErrors = {};

        if (!firstName.trim()) e.firstName = t("genericErrors.requiredField");
        else if (firstName.trim().length > 50) e.firstName = t("genericErrors.max", { max: 50 });

        if (!lastName.trim()) e.lastName = t("genericErrors.requiredField");
        else if (lastName.trim().length > 50) e.lastName = t("genericErrors.max", { max: 50 });

        if (!username.trim()) e.username = t("genericErrors.requiredField");
        else if (username.trim().length > 50) e.username = t("genericErrors.max", { max: 50 });

        if (!email.trim()) e.email = t("genericErrors.requiredField");
        else if (email.trim().length > 100) e.email = t("genericErrors.max", { max: 100 });
        else if (!isEmail(email)) e.email = t("genericErrors.emailInvalid");

        if (!password) e.password = t("genericErrors.requiredField");
        else if (password.length < 8) e.password = t("genericErrors.min", { min: 8 });
        else if (password.length > 100) e.password = t("genericErrors.max", { max: 100 });

        if (!confirmPassword) e.confirmPassword = t("genericErrors.requiredField");
        else if (confirmPassword !== password) e.confirmPassword = t("register.passwordsDoNotMatch");

        return e;
    };

    const onSubmit = async () => {
        const e = validate();
        setErrors(e);

        if (Object.keys(e).length > 0) return;

        const user = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            userName: username.trim(),
            email: email.trim(),
            password,
        };

        navigation.navigate("Allergies", { user });
        
    };

    const clearError = (key: keyof RegisterErrors) => {
        if (!errors[key]) return;
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    //Muestra errores en caso de venir de la pantalla anterior.
    useEffect(() => {
        const err = route.params?.backendError;
        if (!err?.fieldErrors) return;

        const fe = err.fieldErrors;
        setErrors((prev) => ({
            ...prev,
            username: fe.userName ? (Array.isArray(fe.userName) ? fe.userName[0] : fe.userName) : prev.username,
            email: fe.email ? (Array.isArray(fe.email) ? fe.email[0] : fe.email) : prev.email,
            password: fe.password ? (Array.isArray(fe.password) ? fe.password[0] : fe.password) : prev.password,
        }));
    }, [route.params?.backendError]);


    return (

        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                <View style={styles.logoWrap}>
                    <Ionicons name="restaurant" size={30} color="#2bee7c" />
                </View>

                <Text style={styles.title}>{t("register.title")}</Text>
                <Text style={styles.subtitle}>
                    {t("register.subtitle")}
                </Text>

                
                {/* 2 columnas Nombre / Apellidos */}
                <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                    <FormLabel text={t("register.firstName")} />
                    <InputLabel
                        placeholder={t("register.firstNamePlaceholder")}
                        value={firstName}
                        onChangeText={(v) => { setFirstName(v); clearError("firstName"); }}
                        returnKeyType="next"
                        errorText={errors.firstName}
                    />
                    </View>

                    <View style={{ width: 12 }} />

                    <View style={{ flex: 1 }}>
                    <FormLabel text={t("register.lastName")} />
                    <InputLabel
                        placeholder={t("register.lastNamePlaceholder")}
                        value={lastName}
                        onChangeText={(v) => { setLastName(v); clearError("lastName"); }}
                        returnKeyType="next"
                        errorText={errors.lastName}
                    />
                    </View>
                </View>

                <FormLabel text={t("register.username")} />
                <InputLabel
                    leftIcon="at"
                    placeholder={t("register.usernamePlaceholder")}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={(v) => { setUsername(v); clearError("username"); }}
                    returnKeyType="next"
                    errorText={errors.username}
                />

                <FormLabel text={t("register.email")} />
                <InputLabel
                    leftIcon="mail"
                    placeholder={t("register.emailPlaceholder")}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(v) => { setEmail(v); clearError("email"); }}
                    returnKeyType="next"
                    errorText={errors.email}
                />

                <FormLabel text={t("register.password")} />
                <InputLabel
                    leftIcon="lock-closed"
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword((v) => !v)}
                    placeholder={t("register.passwordPlaceholder")}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v) => { setPassword(v); clearError("password"); }}
                    returnKeyType="done"
                    errorText={errors.password}
                />

                <FormLabel text={t("register.confirmPassword")} />
                <InputLabel
                    leftIcon="lock-closed"
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
                    returnKeyType="done"
                    errorText={errors.confirmPassword}
                />

                <PrimaryButton text={t("register.submit")} onPress={onSubmit}/>

                <View style={styles.switchWrap}>
                    <Text style={styles.switchText}>{t("register.haveAccount")}</Text>
                    <Pressable onPress={() => navigation.navigate("Login")} hitSlop={8}>
                        <Text style={styles.switchLink}>{t("register.goToLogin")}</Text>
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

row2: { flexDirection: "row", marginTop: 8 },
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
