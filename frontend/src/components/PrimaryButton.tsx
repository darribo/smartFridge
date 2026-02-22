import { Pressable, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

export function PrimaryButton({text, onPress, disabled=false, rightIcon} : Props){
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
            {rightIcon ? (
              <MaterialCommunityIcons
                name={rightIcon}
                size={24}
                color="#102218"
                style={styles.icon}
              />
            ) : null}
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
    flexDirection: "row",
    gap: 10,
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
  icon: {
    marginTop: 1,
  },
});
