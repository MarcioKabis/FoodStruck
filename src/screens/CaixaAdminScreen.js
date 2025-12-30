import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CaixaAdminScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      {/* BOTÃO USUÁRIOS */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Usuarios")}
      >
        <Text style={styles.buttonText}>Usuários</Text>
      </TouchableOpacity>

      {/* BOTÃO MOVIMENTAÇÕES */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate("Movimentacoes")}
      >
        <Text style={styles.buttonText}>Movimentações</Text>
      </TouchableOpacity>

    </View>
  );
}

/* =====================
   ESTILOS (UNIFICADOS)
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#111827",
  },
  button: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: "#16A34A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
