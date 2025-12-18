import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";

import EstoqueService from "../services/EstoqueService";

export default function EstoqueScreen() {
  const [estoque, setEstoque] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("0");
  const [busca, setBusca] = useState("");
  const [movimentacoes, setMovimentacoes] = useState({});
  const [modalVisivel, setModalVisivel] = useState(false);
  const [resultadoBusca, setResultadoBusca] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);

  useEffect(() => {
    const unsubscribe = EstoqueService.ouvirEstoque(setEstoque);
    return unsubscribe;
  }, []);

  async function handleAdicionar() {
    try {
      if (!nome.trim()) {
        Alert.alert("Erro", "Informe o nome do produto");
        return;
      }

      await EstoqueService.criarProdutoEstoque({
        nome,
        descricao,
        quantidade: Number(quantidade) || 0,
      });

      setNome("");
      setDescricao("");
      setQuantidade("0");
      setModalVisivel(false);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  }

  async function handleExcluir(id) {
    try {
      await EstoqueService.excluirProduto(id);
      Alert.alert("Sucesso", "Produto excluído com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o produto: " + error.message);
    }
  }

  async function aumentar(id) {
    const valor = Number(movimentacoes[id] || 0);
    if (valor <= 0) return Alert.alert("Erro", "Informe um valor válido");

    await EstoqueService.aumentarQuantidade(id, valor);
    setMovimentacoes((prev) => ({ ...prev, [id]: "" }));
  }

  async function diminuir(id) {
    const valor = Number(movimentacoes[id] || 0);
    if (valor <= 0) return Alert.alert("Erro", "Informe um valor válido");

    await EstoqueService.diminuirQuantidade(id, valor);
    setMovimentacoes((prev) => ({ ...prev, [id]: "" }));
  }

  function buscarProduto() {
    const filtrado = estoque.filter((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (filtrado.length === 0) {
      Alert.alert("Não encontrado", "Nenhum produto corresponde à busca");
    }
    setResultadoBusca(filtrado);
    setEstoqueCritico([]); // Limpar lista crítica
  }

  function exibirEstoque() {
    setResultadoBusca([]);
    setBusca("");
    setEstoqueCritico([]); // Limpar lista crítica
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

      {/* Botão para abrir Modal */}
      <Pressable style={styles.botao} onPress={() => setModalVisivel(true)}>
        <Text style={styles.botaoTexto}>Cadastrar produto</Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={modalVisivel} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Produto</Text>

            <TextInput
              placeholder="Nome do produto"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />

            <TextInput
              placeholder="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              style={styles.input}
            />

            <TextInput
              placeholder="Quantidade inicial"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              style={styles.input}
            />

            <Pressable style={styles.botao} onPress={handleAdicionar}>
              <Text style={styles.botaoTexto}>Adicionar</Text>
            </Pressable>

            <Pressable
              style={[styles.botao, { backgroundColor: "#aaa", marginTop: 8 }]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.botaoTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Busca, Exibir Estoque e Estoque Crítico */}
      <View style={styles.containerBusca}>
        <TextInput
          placeholder="nome do produto"
          value={busca}
          onChangeText={setBusca}
          style={styles.inputBusca}
        />
        <Pressable style={styles.botaoBusca} onPress={buscarProduto}>
          <Text style={{ color: "#fff" }}>Buscar</Text>
        </Pressable>
      </View>

      <View style={styles.outros}>
        <Pressable style={styles.botaoBusca1} onPress={exibirEstoque}>
          <Text style={styles.outroButon}>Exibir Estoque</Text>
        </Pressable>
        <Pressable style={styles.botaoBusca1} onPress={mostrarEstoqueCritico}>
          <Text style={styles.outroButon}>reposição</Text>
        </Pressable>
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
            </View>
          ))}
        </View>
      )}

      {/* Mensagem quando não há produtos cadastrados e não há produtos críticos */}
      {estoqueCritico.length === 0 && listaExibir.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" }}>
          Nenhum produto cadastrado no estoque.
        </Text>
      )}

      {/* Lista de produtos completa só aparece quando não há produtos críticos */}
      {estoqueCritico.length === 0 && listaExibir.length > 0 && (
        <FlatList
          data={listaExibir}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>{item.descricao}</Text>
              <Text>Quantidade atual: {item.quantidade}</Text>

              <TextInput
                placeholder="Quantidade a ser acrescentada ou retirada"
                value={movimentacoes[item.id] || ""}
                onChangeText={(text) =>
                  setMovimentacoes((prev) => ({
                    ...prev,
                    [item.id]: text,
                  }))
                }
                keyboardType="numeric"
                style={styles.inputMov}
              />

              <View style={styles.linhaBotoes}>
                <Pressable style={styles.botaoQtd} onPress={() => diminuir(item.id)}>
                  <Text>-</Text>
                </Pressable>

                <Pressable style={styles.botaoQtd} onPress={() => aumentar(item.id)}>
                  <Text>+</Text>
                </Pressable>

                <Pressable style={styles.botaoExcluir} onPress={() => handleExcluir(item.id)}>
                  <Text style={{ color: "#fff" }}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
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
    flexWrap: "wrap",
    width: "40%",
    alignSelf: "center",
    justifyContent: "space-between",
  },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 8 },
  inputBusca: { borderWidth: 1, borderColor: "#aaa", borderRadius: 6, padding: 10, width: "84%", marginRight: 15 },
  inputMov: { borderWidth: 1, borderColor: "#bbb", borderRadius: 6, padding: 8, marginTop: 6, marginBottom: 8, width: 283 },
  botao: { backgroundColor: "#2e86de", padding: 12, borderRadius: 6, alignItems: "center", marginBottom: 10, width: "40%", alignSelf: "center" },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  botaoBusca: { backgroundColor: "#2e86de", padding: 12, borderRadius: 6, marginBottom: 6},
  botaoBusca1: { backgroundColor: "#2e86de", padding: 12, borderRadius: 6, marginBottom: 6,width:"48%"},
  card: { backgroundColor: "#f5f5f5", padding: 12, borderRadius: 8, marginBottom: 10 },
  nome: { fontWeight: "bold", fontSize: 16 },
  linhaBotoes: { flexDirection: "row", marginTop: 8, alignItems: "center", gap: 8 },
  botaoQtd: { backgroundColor: "#ddd", padding: 8, borderRadius: 4 },
  botaoExcluir: { backgroundColor: "#e74c3c", padding: 8, borderRadius: 4, marginLeft: "auto" },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  outros: { flexDirection: "row", alignItems: "center", marginBottom: 12, flexWrap: "wrap", width: "40%", alignSelf: "center",justifyContent: "space-between" },
  outroButon: { textAlign: "center", color: "#fff" },
});
