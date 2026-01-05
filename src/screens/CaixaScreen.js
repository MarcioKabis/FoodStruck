import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import CaixaService from "../services/CaixaService";
import { listarProdutos } from "../services/ProdutosService";
import { criarPedido } from "../services/PedidosService";

export default function CaixaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { caixaId } = route.params || {};

  const [caixa, setCaixa] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [itensPedido, setItensPedido] = useState([]);
  const [totalPedido, setTotalPedido] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");

  const [loading, setLoading] = useState(true);
  const [salvandoPedido, setSalvandoPedido] = useState(false);
  const [fechando, setFechando] = useState(false);

  useEffect(() => {
    if (!caixaId) {
      navigation.replace("Home");
      return;
    }

    const carregarDados = async () => {
      try {
        const caixaAtual = await CaixaService.caixaAberto();
        if (!caixaAtual || caixaAtual.id !== caixaId) {
          Alert.alert("Aviso", "Caixa não encontrado ou fechado");
          navigation.replace("Home");
          return;
        }

        const listaProdutos = await listarProdutos();

        setCaixa(caixaAtual);
        setProdutos(listaProdutos);
      } catch (error) {
        Alert.alert("Erro", "Erro ao carregar dados");
        navigation.replace("Home");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [caixaId]);

  const adicionarProduto = (produto) => {
    setItensPedido((prev) => {
      const existente = prev.find((p) => p.id === produto.id);

      let novoPedido;
      if (existente) {
        novoPedido = prev.map((p) =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        );
      } else {
        novoPedido = [
          ...prev,
          {
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1,
          },
        ];
      }

      const novoTotal = novoPedido.reduce(
        (sum, item) => sum + item.preco * item.quantidade,
        0
      );
      setTotalPedido(novoTotal);

      return novoPedido;
    });
  };

  const finalizarPedido = async () => {
    if (itensPedido.length === 0) {
      Alert.alert("Aviso", "Nenhum produto no pedido");
      return;
    }

    try {
      setSalvandoPedido(true);

      await criarPedido({
        usuarioId: caixa.usuario?.id,
        caixaId: caixa.id,
        total: totalPedido,
        itens: itensPedido,
        formaPagamento,
      });

      Alert.alert("Sucesso", "Pedido registrado");
      setItensPedido([]);
      setTotalPedido(0);
    } catch (error) {
      Alert.alert("Erro", error.message || "Erro ao salvar pedido");
    } finally {
      setSalvandoPedido(false);
    }
  };

  const fecharCaixa = async () => {
    try {
      setFechando(true);
      await CaixaService.fecharCaixa(caixa.id, caixa.total || 0);
      Alert.alert("Sucesso", "Caixa fechado");
      navigation.replace("Home");
    } catch {
      Alert.alert("Erro", "Erro ao fechar caixa");
    } finally {
      setFechando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Caixa Aberto</Text>

      <Text style={styles.usuario}>
        Usuário: {caixa.usuario?.nome || "Não informado"}
      </Text>

      {/* ===== CARDÁPIO ===== */}
      <Text style={styles.subTitle}>Cardápio</Text>
      <View style={styles.cardsContainer}>
        {produtos.map((produto) => (
          <TouchableOpacity
            key={produto.id}
            style={styles.card}
            onPress={() => adicionarProduto(produto)}
          >
            <Text style={styles.cardTitulo}>{produto.nome}</Text>
            <Text style={styles.cardDescricao}>{produto.descricao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== RESUMO PEDIDO ===== */}
      <Text style={styles.subTitle}>Pedido</Text>
      {itensPedido.length === 0 ? (
        <Text>Nenhum item selecionado</Text>
      ) : (
        <>
          {itensPedido.map((item) => (
            <View key={item.id} style={styles.pedidoItem}>
              <Text style={{ flex: 1 }}>
                {item.nome} x{item.quantidade} — R${(item.preco * item.quantidade).toFixed(2)}
              </Text>
              <TouchableOpacity
                style={styles.excluirBotao}
                onPress={() => {
                  const novoPedido = itensPedido.filter((p) => p.id !== item.id);
                  setItensPedido(novoPedido);
                  const novoTotal = novoPedido.reduce(
                    (sum, i) => sum + i.preco * i.quantidade,
                    0
                  );
                  setTotalPedido(novoTotal);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.total}>Total: R${totalPedido.toFixed(2)}</Text>
        </>
      )}

      {/* ===== FORMA DE PAGAMENTO ===== */}
      <Text style={styles.subTitle}>Forma de Pagamento</Text>
      <View style={styles.pagamentoContainer}>
        {["dinheiro", "cartão de débito", "cartão de crédito"].map((forma) => (
          <TouchableOpacity
            key={forma}
            style={[
              styles.pagamentoBotao,
              formaPagamento === forma && styles.pagamentoSelecionado,
            ]}
            onPress={() => setFormaPagamento(forma)}
          >
            <Text
              style={{
                color: formaPagamento === forma ? "#fff" : "#000",
                fontWeight: "bold",
              }}
            >
              {forma}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={salvandoPedido ? "Salvando..." : "Finalizar Pedido"}
        onPress={finalizarPedido}
        disabled={salvandoPedido}
      />

      <View style={{ marginTop: 16 }}>
        <Button
          title={fechando ? "Fechando..." : "Fechar Caixa"}
          onPress={fecharCaixa}
          disabled={fechando}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  usuario: {
    textAlign: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 12,
  },
  cardsContainer: {
    width: "50%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "30%",
    minWidth: 100,
    maxWidth: 150,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#d4e0ecff",
    margin: 8,
    alignItems: "center",
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardDescricao: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  pedidoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    width: "80%",
  },
  excluirBotao: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  total: {
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  pagamentoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
    width: "100%",
  },
  pagamentoBotao: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#007AFF",
    backgroundColor: "#d4e0ecff",
  },
  pagamentoSelecionado: {
    backgroundColor: "#007AFF",
  },
});
