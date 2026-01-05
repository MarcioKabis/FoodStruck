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

  /* =========================
     ADICIONAR PRODUTO AO PEDIDO
  ========================= */
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

  /* =========================
     FINALIZAR PEDIDO
  ========================= */
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

      {/* ===== RESUMO PEDIDO ===== */}
      <Text style={styles.subTitle}>Pedido</Text>
      {itensPedido.length === 0 ? (
        <Text>Nenhum item selecionado</Text>
      ) : (
        <>
          {itensPedido.map((item) => (
            <Text key={item.id}>
              {item.nome} x{item.quantidade} — R${(item.preco * item.quantidade).toFixed(2)}
            </Text>
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
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDescricao: {
    fontSize: 14,
    color: "#555",
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
  },
  pagamentoBotao: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#007AFF",
  },
  pagamentoSelecionado: {
    backgroundColor: "#007AFF",
  },
});
