import { useTranslation } from "react-i18next"
import { Pressable, StyleSheet, Text } from "react-native";
import { THEME } from "../../theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
    onGenerateLink(): void
}


export function GenerateInviteButton ( { onGenerateLink }: Props) {

    const { t } = useTranslation();

    return(
        <Pressable style={styles.button} onPress={onGenerateLink}>
            <MaterialCommunityIcons name="link-variant" size={22} color="#fff" />
            <Text style={styles.text}>
                {t("households.generateInviteLink")}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME.bg,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});