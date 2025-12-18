import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function Loading({ text = "Carregando..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#111827",
  },
});
