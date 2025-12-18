import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import Loading from "../components/Loading";
import { movimentacoesCaixaCollection, onSnapshot, addDoc, serverTimestamp } from "../services/firebase";

export default function CaixaScreen() {
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(movimentacoesCaixaCollection, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovimentacoes(items);
      const total = items.reduce((acc, mov) => (mov.tipo === "entrada" ? acc + Number(mov.valor) : acc - Number(mov.valor)), 0);
      setSaldo(total);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <Loading text="Carregando Caixa..." />;

  const adicionarMovimentacao = async (tipo) => {
    Alert.prompt(
      tipo === "entrada" ? "Adicionar Entrada" : "Adicionar Saída",
      "Informe o valor:",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Adicionar",
          onPress: async (valor) => {
            const numericValor = Number(valor);
            if (isNaN(numericValor) || numericValor <= 0) {
              Alert.alert("Valor inválido!");
              return;
            }
            try { await addDoc(movimentacoesCaixaCollection, { tipo, valor: numericValor, createdAt: serverTimestamp() }); }
            catch (error) { console.error(error); }
          },
        },
      ],
      "plain-text"
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.tipo === "entrada" ? "💵 Entrada" : "💸 Saída"} - R$ {item.valor}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caixa</Text>
      <Text style={styles.saldo}>Saldo atual: R$ {saldo.toFixed(2)}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#16A34A" }]} onPress={() => adicionarMovimentacao("entrada")}>
          <Text style={styles.buttonText}>Adicionar Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#DC2626" }]} onPress={() => adicionarMovimentacao("saida")}>
          <Text style={styles.buttonText}>Adicionar Saída</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movimentacoes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma movimentação registrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#111827" },
  saldo: { fontSize: 18, marginBottom: 16, color: "#111827" },
  buttons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
  buttonText: { color: "#FFF", fontWeight: "600" },
  item: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({ android: { elevation: 2 }, ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }, web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" } }),
  },
  itemText: { fontSize: 16, color: "#111827" },
  emptyText: { fontSize: 16, color: "#6B7280", textAlign: "center", marginTop: 32 },
});
