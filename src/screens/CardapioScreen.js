import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import Loading from "../components/Loading";
import { listarProdutos } from "../services/ProdutosService";

export default function CardapioScreen() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const itens = await listarProdutos();
      setProdutos(itens);
    } catch (error) {
      alert("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  if (loading) return <Loading text="Carregando cardápio..." />;

  const categorias = [...new Set(produtos.map((p) => p.categoria))];

  return (
    <ScrollView style={styles.container}>
      {categorias.map((categoria) => (
        <View key={categoria} style={styles.categoriaCard}>
          <Text style={styles.categoriaTitle}>{categoria}</Text>
          {produtos
            .filter((p) => p.categoria === categoria)
            .map((produto) => (
              <View key={produto.id} style={styles.produtoCard}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoDescricao}>{produto.descricao}</Text>
                <Text style={styles.produtoPreco}>
                  R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  categoriaCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" },
    }),
  },
  categoriaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  produtoCard: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  produtoDescricao: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  produtoPreco: {
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
    fontWeight: "500",
  },
});
