import { Text, StyleSheet } from "react-native";

export function FormLabel( { text }: {text: string} ) {

    return <Text style={styles.label}>{text}</Text>;

}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        marginLeft: 4,
        color: "#0d1b13",
    },
})