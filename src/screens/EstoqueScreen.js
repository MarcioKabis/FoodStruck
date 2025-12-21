import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Alert } from "react-native";
import EstoqueService from "../services/EstoqueService";

export default function EstoqueScreen() {
  const [estoque, setEstoque] = useState([]);
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);

  useEffect(() => {
    const unsubscribe = EstoqueService.ouvirEstoque(setEstoque);
    return unsubscribe;
  }, []);

  function buscarProduto() {
    const filtrado = estoque.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (filtrado.length === 0) {
      Alert.alert("Não encontrado", "Nenhum produto corresponde à busca");
    }
    setResultadoBusca(filtrado);
    setEstoqueCritico([]);
  }

  function exibirEstoque() {
    setResultadoBusca([]);
    setBusca("");
    setEstoqueCritico([]);
  }

  function mostrarEstoqueCritico() {
    const filtrado = estoque.filter(item => item.quantidade < 10);
    if (filtrado.length === 0) {
      Alert.alert("Estoque crítico", "Não há produtos com quantidade menor que 10.");
    }
    setEstoqueCritico(filtrado);
    setResultadoBusca([]);
    setBusca("");
  }

  const listaExibir = busca ? resultadoBusca : estoque;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📦 Controle de Estoque</Text>

      {/* Busca, Exibir Estoque e Estoque Crítico */}
      <View style={styles.containerBusca}>
        <TextInput
          placeholder="nome do produto"
          value={busca}
          onChangeText={setBusca}
          style={styles.inputBusca}
        />
        <Text
          onPress={buscarProduto}
          style={[styles.botaoBuscaTexto]}
        >
          Buscar
        </Text>
      </View>

      <View style={styles.outros}>
        <Text
          onPress={exibirEstoque}
          style={styles.outroButon}
        >
          Exibir Estoque
        </Text>
        <Text
          onPress={mostrarEstoqueCritico}
          style={styles.outroButon}
        >
          Reposição
        </Text>
      </View>

      {/* Lista produtos críticos */}
      {estoqueCritico.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
            Produtos com estoque baixo:
          </Text>
          {estoqueCritico.map((item) => (
            <View
              key={item.id}
              style={{
                padding: 10,
                backgroundColor: "#fdebd0",
                borderRadius: 6,
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.nome}</Text>
              <Text>Quantidade: {item.quantidade}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Lista completa de produtos */}
      {estoqueCritico.length === 0 && listaExibir.length > 0 && (
        <FlatList
          data={listaExibir}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>{item.descricao}</Text>
              <Text>Quantidade atual: {item.quantidade}</Text>
            </View>
          )}
        />
      )}

      {/* Mensagem quando não há produtos */}
      {estoqueCritico.length === 0 && listaExibir.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" }}>
          Nenhum produto cadastrado no estoque.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  containerBusca: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  inputBusca: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    flex: 1,
    marginRight: 8,
  },
  botaoBuscaTexto: {
    backgroundColor: "#2e86de",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
  },
  outros: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  outroButon: {
    backgroundColor: "#2e86de",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  nome: { fontWeight: "bold", fontSize: 16 },
});
