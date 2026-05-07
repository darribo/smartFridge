import { useState } from "react";
import { View, Image, StyleProp, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveImageUri } from "../../utils/image";
import { THEME } from "../../theme/theme";

interface Props {
    image?: string | null;
    style?: StyleProp<ViewStyle>;
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    iconSize?: number;
    resizeMode?: "cover" | "contain" | "stretch" | "center";
}

export function FallbackImage({ image, style, iconName, iconSize = 36, resizeMode = "cover" }: Props) {
    const [error, setError] = useState(false);
    const uri = resolveImageUri(image);

    if (!uri || error) {
        return (
            <View style={[{ alignItems: "center", justifyContent: "center", backgroundColor: THEME.mint2 }, style]}>
                <MaterialCommunityIcons name={iconName} size={iconSize} color={THEME.primary} />
            </View>
        );
    }

    return (
        <Image
            source={{ uri }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={style as any}
            resizeMode={resizeMode}
            onError={() => setError(true)}
        />
    );
}
