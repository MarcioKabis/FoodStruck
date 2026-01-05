import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CaixaService from "../services/CaixaService";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loadingCaixa, setLoadingCaixa] = useState(false);

  const entrarNoCaixa = async () => {
    if (loadingCaixa) return;
    try {
      setLoadingCaixa(true);
      const caixa = await CaixaService.caixaAberto();

      if (caixa) {
        navigation.navigate("Caixa", { caixaId: caixa.id });
      } else {
        navigation.navigate("AberturaCaixa");
      }
    } catch (error) {
      console.error("Erro ao acessar caixa:", error);
      Alert.alert("Erro", "Não foi possível acessar o caixa.");
    } finally {
      setLoadingCaixa(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FoodStack</Text>
        <Text style={styles.subtitle}>Gestão simples do seu Food Truck</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Cardapio")}>
          <Text style={styles.cardTitle}>🍔 Cardápio</Text>
          <Text style={styles.cardDesc}>Visualização</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Estoque")}>
          <Text style={styles.cardTitle}>📦 Estoque</Text>
          <Text style={styles.cardDesc}>Visualização</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={entrarNoCaixa}>
          <Text style={styles.cardTitle}>💰 Caixa</Text>
          <Text style={styles.cardDesc}>{loadingCaixa ? "Verificando..." : "Abertura e fechamento"}</Text>
          {loadingCaixa && <ActivityIndicator size="small" color="#007AFF" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardAdmin} onPress={() => navigation.navigate("LoginAdmin")}>
          <Text style={styles.cardTitle}>🔑 Administrador</Text>
          <Text style={styles.cardDesc}>Acesso à área restrita</Text>
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
  header: { marginBottom: 24, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  menu: { flex: 1 },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({ android: { elevation: 3 }, ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }, web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" } }),
  },
  cardAdmin: {
    backgroundColor: "#FFE4E1",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({ android: { elevation: 3 }, ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }, web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" } }),
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  footer: { alignItems: "center", paddingVertical: 8 },
  footerText: { fontSize: 12, color: "#9CA3AF" },
});
