import React from "react";
import { Text, View, TextInput, StyleSheet, Pressable, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = TextInputProps & {
    leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
    rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
    onRightIconPress?: () => void;
    errorText?: string;
};

export function InputLabel({
    leftIcon,
    rightIcon,
    onRightIconPress,
    errorText,
    ...props
}: Props) {

    const hasError = !!errorText;

    return (
        <View style={styles.container}>
            {leftIcon ? (
                <Ionicons name={leftIcon} size={20} color="#3d8f66" style={styles.leftIcon} />
            ) : null}

            <TextInput
                {...props}
                style={[
                    styles.input,
                    leftIcon ? { paddingLeft: 44 } : null,
                    rightIcon ? { paddingRight: 44 } : null,
                ]}
                placeholderTextColor="#8fb8a2"
            />

            {rightIcon ? (
                <Pressable onPress={onRightIconPress} style={styles.rightIconBtn}>
                    <Ionicons name={rightIcon} size={20} color="#3d8f66" />
                </Pressable>
            ) : null}

            {hasError ? <Text style={styles.errorText}>{errorText}</Text> : null}
        </View>

    );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#cfe7d9",
    backgroundColor: "#f8fcfa",
    justifyContent: "center",
    marginBottom: 14,
  },
  input: {
    height: 54,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#0d1b13",
  },
  leftIcon: {
    position: "absolute",
    left: 16,
  },
  rightIconBtn: {
    position: "absolute",
    right: 16,
    height: 54,
    justifyContent: "center",
  },
   errorText: {
    marginTop: 6,
    marginLeft: 8,
    color: "#e53935",
    fontSize: 12,
    fontWeight: "600",
  },
});
