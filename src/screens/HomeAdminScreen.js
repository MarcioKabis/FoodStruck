import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function HomeAdminScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Em web, usamos confirm() para substituir o Alert
    const confirmLogout = Platform.OS === "web" ? window.confirm("Deseja realmente sair do modo administrador?") : true;

    if (confirmLogout) {
      signOut(auth)
        .then(() => {
          // Reset de navegação
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        })
        .catch((error) => {
          console.error("Erro ao sair:", error);
          if (Platform.OS !== "web") alert("Não foi possível sair. Tente novamente.");
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FoodStack - Admin</Text>
        <Text style={styles.subtitle}>Gestão completa do seu Food Truck</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("CardapioAdmin")} activeOpacity={0.7}>
          <Text style={styles.cardTitle}>🍔 Cardápio</Text>
          <Text style={styles.cardDesc}>Cadastrar,editar e excluir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("EstoqueAdmin")} activeOpacity={0.7}>
          <Text style={styles.cardTitle}>📦 Estoque</Text>
          <Text style={styles.cardDesc}>Cadastrar,editar e excluir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Caixa")} activeOpacity={0.7}>
          <Text style={styles.cardTitle}>💰 Caixa</Text>
          <Text style={styles.cardDesc}>Cadastrar usuários e movimentações</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair do Admin</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Usuário Administrador • Firebase</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: { marginBottom: 24, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  menu: { flex: 1 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" },
    }),
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  footer: { alignItems: "center", paddingVertical: 16 },
  footerText: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
});
