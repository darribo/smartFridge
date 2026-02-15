import React from "react";
import { View, Text } from "react-native";

export function GlobalErrorBox({ messages }: { messages: string[] }) {
  if (!messages?.length) return null;

  return (
    <View style={{ padding: 12, borderRadius: 12, backgroundColor: "#ffe9e9" }}>
      {messages.map((m, i) => (
        <Text key={i} style={{ color: "#b00020", fontWeight: "700" }}>
          {m}
        </Text>
      ))}
    </View>
  );
}
