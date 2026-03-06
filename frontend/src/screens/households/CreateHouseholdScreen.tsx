import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormLabel } from "../../components/FormLabel";
import { InputLabel } from "../../components/users/InputLabel";
import { PrimaryButton } from "../../components/PrimaryButton";
import { GlobalErrorBox } from "../../components/common/GlobalErrorBox";
import { createHousehold } from "../../api/households/householdService";
import type { ApiError } from "../../api/appFetch";
import type { AuthStackParamList } from "../../navigation/AuthStack";
import { THEME } from "../../theme/theme";

type HouseholdErrors = Partial<{
  name: string;
  description: string;
}>;

type Props = NativeStackScreenProps<AuthStackParamList, "CreateHousehold">;

export default function CreateHouseholdScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<HouseholdErrors>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): HouseholdErrors => {
    const next: HouseholdErrors = {};

    if (!name.trim()) next.name = t("genericErrors.requiredField");
    else if (name.trim().length > 30)
      next.name = t("genericErrors.max", { max: 30 });

    if (description.length > 500)
      next.description = t("genericErrors.max", { max: 500 });

    return next;
  };

  const clearError = (key: keyof HouseholdErrors) => {
    if (!errors[key]) return;
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    setGlobalErrors([]);

    if (Object.keys(nextErrors).length > 0 || submitting) return;

    setSubmitting(true);

    await createHousehold(
      {
        name: name.trim(),
        description: description.trim(),
      },
      (household) => {
        console.log(`${household.name} creado con éxito`);
        navigation.navigate("MyHouseholds");
      },
      (err: ApiError) => {
        if (err.fieldErrors) {
          const fieldErrors = err.fieldErrors;
          setErrors((prev) => ({
            ...prev,
            name: fieldErrors.name
              ? Array.isArray(fieldErrors.name)
                ? fieldErrors.name[0]
                : fieldErrors.name
              : prev.name,
            description: fieldErrors.description
              ? Array.isArray(fieldErrors.description)
                ? fieldErrors.description[0]
                : fieldErrors.description
              : prev.description,
          }));
        }
        setGlobalErrors(err.globalErrors ?? [t("createHousehold.defaultError")]);
      }
    );

    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={THEME.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentWrap}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t("createHousehold.title")}</Text>
          <Text style={styles.subtitle}>
            {t("createHousehold.subtitle")}
          </Text>

          {globalErrors.length > 0 ? (
            <View style={styles.globalErrorWrap}>
              <GlobalErrorBox messages={globalErrors} />
            </View>
          ) : null}

          <FormLabel text={t("createHousehold.householdName")} />
          <InputLabel
            placeholder={t("createHousehold.householdNamePlaceholder")}
            value={name}
            onChangeText={(v) => {
              setName(v);
              clearError("name");
              if (globalErrors.length) setGlobalErrors([]);
            }}
            maxLength={30}
            returnKeyType="next"
            errorText={errors.name}
          />

          <Text style={styles.optionalLabel}>
            {t("createHousehold.description")}{" "}
            <Text style={styles.optionalText}>
              ({t("createHousehold.optional")})
            </Text>
          </Text>
          <View style={styles.descriptionWrap}>
            <TextInput
              style={styles.descriptionInput}
              placeholder={t("createHousehold.descriptionPlaceholder")}
              placeholderTextColor="#8da0ba"
              value={description}
              onChangeText={(v) => {
                setDescription(v);
                clearError("description");
                if (globalErrors.length) setGlobalErrors([]);
              }}
              multiline
              textAlignVertical="top"
              maxLength={500}
              underlineColorAndroid="transparent"
            />
          </View>
          {errors.description ? (
            <Text style={styles.fieldError}>{errors.description}</Text>
          ) : null}

          <View style={styles.footer}>
            <PrimaryButton
              text={t("createHousehold.submit")}
              onPress={onSubmit}
              disabled={submitting}
              rightIcon="plus-circle"
            />
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>{t("createHousehold.cancel")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8f7" },
  screen: { flex: 1, backgroundColor: "#f6f8f7" },
  header: {
    backgroundColor: "#f6f8f7",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 6,
  },
  content: {
    flex: 1,
    backgroundColor: "#f6f8f7",
  },
  contentWrap: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
    maxWidth: 420,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    color: "#0d1b13",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#486356",
    marginBottom: 28,
    fontWeight: "600",
  },
  globalErrorWrap: {
    marginBottom: 16,
  },
  optionalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0d1b13",
    marginBottom: 6,
    marginLeft: 4,
  },
  optionalText: {
    fontWeight: "500",
    color: "#7f9488",
  },
  descriptionWrap: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#cfe7d9",
    backgroundColor: "#f8fcfa",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  descriptionInput: {
    minHeight: 110,
    fontSize: 16,
    lineHeight: 24,
    color: "#0d1b13",
    padding: 0,
    borderWidth: 0,
    borderColor: "transparent",
  },
  fieldError: {
    marginTop: 6,
    marginLeft: 8,
    color: "#e53935",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    marginTop: 10,
  },
  cancelBtn: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#486356",
  },
});
