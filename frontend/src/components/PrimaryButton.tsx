import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
    text: string;
    onPress: () => void;
    disabled?: boolean;
};

export function PrimaryButton({text, onPress, disabled=false} : Props){
    return(
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28, 
    backgroundColor: "#2bee7c",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#2bee7c",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: "900",
    color: "#102218",
  },
});