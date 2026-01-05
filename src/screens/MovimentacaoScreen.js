import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import { listarPedidos } from "../services/PedidosService";

export default function MovimentacaoScreen() {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const calcularMovimentacao = async () => {
    if (!dataInicial || !dataFinal) {
      Alert.alert("Aviso", "Informe as duas datas");
      return;
    }

    setLoading(true);

    try {
      const pedidos = await listarPedidos();

      // converte dd/mm/yyyy para Date
      const parseData = (str) => {
        const [dia, mes, ano] = str.split("/").map(Number);
        return new Date(ano, mes - 1, dia, 0, 0, 0);
      };

      const inicio = parseData(dataInicial);
      const fim = parseData(dataFinal);

      // filtra pedidos usando p.data (string dd/mm/yyyy)
      const pedidosFiltrados = pedidos.filter((p) => {
        if (!p.data) return false;
        const [d, m, a] = p.data.split("/").map(Number);
        const pedidoData = new Date(a, m - 1, d, 0, 0, 0);
        return pedidoData >= inicio && pedidoData <= fim;
      });

      // função para somar subtotal dos itens
      const calcularTotalPedido = (pedido) =>
        (pedido.itens || []).reduce(
          (sum, item) => sum + parseFloat(item.subtotal || 0),
          0
        );

      // somatórios detalhados
      const totalGeral = pedidosFiltrados.reduce(
        (sum, p) => sum + calcularTotalPedido(p),
        0
      );

      const totalDinheiro = pedidosFiltrados
        .filter((p) => p.formaPagamento === "dinheiro")
        .reduce((sum, p) => sum + calcularTotalPedido(p), 0);

      const totalCartaoDebito = pedidosFiltrados
        .filter((p) => p.formaPagamento === "cartão de débito")
        .reduce((sum, p) => sum + calcularTotalPedido(p), 0);

      const totalCartaoCredito = pedidosFiltrados
        .filter((p) => p.formaPagamento === "cartão de crédito")
        .reduce((sum, p) => sum + calcularTotalPedido(p), 0);

      setResultado({
        numeroPedidos: pedidosFiltrados.length,
        totalGeral,
        totalDinheiro,
        totalCartaoDebito,
        totalCartaoCredito,
      });
    } catch (error) {
      Alert.alert("Erro", "Erro ao calcular movimentação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      

      <Text>Data Inicial (dd/mm/yyyy)</Text>
      <TextInput
        style={styles.input}
        value={dataInicial}
        onChangeText={setDataInicial}
        placeholder="dd/mm/yyyy"
      />

      <Text>Data Final (dd/mm/yyyy)</Text>
      <TextInput
        style={styles.input}
        value={dataFinal}
        onChangeText={setDataFinal}
        placeholder="dd/mm/yyyy"
      />

      <Button
        title={loading ? "Calculando..." : "Mostrar"}
        onPress={calcularMovimentacao}
        disabled={loading}
      />

      {resultado && (
        <View style={styles.resultado}>
          <Text style={styles.resTitulo}>Resultado</Text>
          <Text>Número de Pedidos: {resultado.numeroPedidos}</Text>
          <Text>Total Geral: R${resultado.totalGeral.toFixed(2)}</Text>
          <Text>Total em Dinheiro: R${resultado.totalDinheiro.toFixed(2)}</Text>
          <Text>Total em Cartão de Débito: R${resultado.totalCartaoDebito.toFixed(2)}</Text>
          <Text>Total em Cartão  de Crédito: R${resultado.totalCartaoCredito.toFixed(2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6, marginVertical: 8 },
  resultado: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
  },
  resTitulo: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
});
