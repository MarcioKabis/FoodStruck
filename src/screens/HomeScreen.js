import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FoodStack</Text>
        <Text style={styles.subtitle}>Gestão simples do seu Food Truck</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Cardapio")}>
          <Text style={styles.cardTitle}>🍔 Produtos</Text>
          <Text style={styles.cardDesc}>Cadastro e edição do cardápio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Estoque")}>
          <Text style={styles.cardTitle}>📦 Estoque</Text>
          <Text style={styles.cardDesc}>Controle de quantidades</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Caixa")}>
          <Text style={styles.cardTitle}>💰 Caixa</Text>
          <Text style={styles.cardDesc}>Abertura, vendas e fechamento</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Usuário anônimo • Firebase</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  menu: { flex: 1, gap: 16 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    ...Platform.select({
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" },
    }),
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  footer: { alignItems: "center", paddingVertical: 8 },
  footerText: { fontSize: 12, color: "#9CA3AF" },
});
