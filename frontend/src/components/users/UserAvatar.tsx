import React, { useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveImage } from "../../utils/image";
import { THEME } from "../../theme/theme";

type Props = {
  avatar?: string | null;
  size: number;
  borderColor?: string;
  borderWidth?: number;
};

export default function UserAvatar({ avatar, size, borderColor = THEME.border, borderWidth = 2 }: Readonly<Props>) {
  const [imageError, setImageError] = useState(false);
  const hasPhoto = avatar && avatar !== "placeholder";
  const uri = hasPhoto ? resolveImage(false, avatar) : null;
  const showImage = uri && !imageError;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%", borderRadius: size / 2 }}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <MaterialCommunityIcons
            name="account-circle"
            size={size * 0.7}
            color={THEME.muted}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: THEME.mint2,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.mint2,
  },
});
