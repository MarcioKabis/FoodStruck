import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, Platform 
} from "react-native";
import EstoqueService from "../services/EstoqueService";

export default function EstoqueAdminScreen() {
  const [estoque, setEstoque] = useState([]);
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);

  const [modalVisible, setModalVisible] = useState(false); // Modal

  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");

  const [editarId, setEditarId] = useState(null);
  const [quantidadeEditar, setQuantidadeEditar] = useState("");

  useEffect(() => {
    const unsubscribe = EstoqueService.ouvirEstoque(setEstoque);
    return unsubscribe;
  }, []);

  const listaExibir = busca ? resultadoBusca : estoqueCritico.length > 0 ? estoqueCritico : estoque;

  // BUSCA
  function buscarProduto() {
    const filtrado = estoque.filter(item =>
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

  // ADICIONAR PRODUTO
  async function handleAdicionarProduto() {
    if (!novoNome || !novaDescricao || !novaQuantidade) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    const quantidade = parseInt(novaQuantidade);
    if (isNaN(quantidade)) {
      Alert.alert("Erro", "Quantidade inválida");
      return;
    }
    try {
      await EstoqueService.criarProdutoEstoque({ nome: novoNome, descricao: novaDescricao, quantidade });
      setNovoNome("");
      setNovaDescricao("");
      setNovaQuantidade("");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  }

  // EDITAR QUANTIDADE
  function iniciarEdicao(item) {
    setEditarId(item.id);
    setQuantidadeEditar("0"); // Valor inicial 0 para somar/diminuir
  }

  // EXCLUIR PRODUTO
  function handleExcluirProduto(item) {
    const confirmar = Platform.OS === "web" 
      ? window.confirm(`Deseja realmente excluir ${item.nome}?`)
      : true;

    if (Platform.OS !== "web") {
      Alert.alert(
        "Excluir Produto",
        `Deseja realmente excluir ${item.nome}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: async () => await EstoqueService.excluirProduto(item.id) }
        ]
      );
      return;
    }

    if (confirmar) {
      EstoqueService.excluirProduto(item.id);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📦 Controle de Estoque - Admin</Text>

      {/* Botão abrir modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.botaoAdicionar}>
        <Text style={styles.textoBotao}>Adicionar Produto</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Produto</Text>
            <TextInput
              placeholder="Nome do produto"
              value={novoNome}
              onChangeText={setNovoNome}
              style={styles.inputAdicionar}
            />
            <TextInput
              placeholder="Descrição"
              value={novaDescricao}
              onChangeText={setNovaDescricao}
              style={styles.inputAdicionar}
            />
            <TextInput
              placeholder="Quantidade"
              value={novaQuantidade}
              onChangeText={setNovaQuantidade}
              keyboardType="numeric"
              style={styles.inputAdicionar}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <TouchableOpacity onPress={handleAdicionarProduto} style={[styles.botaoAdicionar, { flex: 1, marginRight: 5 }]}>
                <Text style={styles.textoBotao}>Adicionar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.botaoCancelar, { flex: 1, marginLeft: 5 }]}>
                <Text style={styles.textoBotao}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Busca */}
      <View style={styles.containerBusca}>
        <TextInput
          placeholder="Nome do produto"
          value={busca}
          onChangeText={setBusca}
          style={styles.inputBusca}
        />
        <TouchableOpacity onPress={buscarProduto} style={styles.botaoBusca}>
          <Text style={styles.botaoBuscaTexto}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Botões de filtro */}
      <View style={styles.outros}>
        <TouchableOpacity onPress={exibirEstoque} style={styles.outroButon}>
          <Text style={styles.outroButonTexto}>Exibir Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={mostrarEstoqueCritico} style={styles.outroButon}>
          <Text style={styles.outroButonTexto}>Reposição</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de produtos */}
      {listaExibir.length > 0 ? (
        <FlatList
          data={listaExibir}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={item.quantidade < 10 ? styles.cardCritico : styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>{item.descricao}</Text>

              {/* Editar quantidade */}
              {editarId === item.id ? (
                <View style={{ marginTop: 4 }}>
                  {/* Mostra quantidade atual */}
                  <Text>Quantidade atual: {item.quantidade}</Text>

                  {/* Campo para digitar valor a somar/diminuir */}
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <TextInput
                      value={quantidadeEditar}
                      onChangeText={setQuantidadeEditar}
                      keyboardType="numeric"
                      style={styles.inputEditar}
                    />

                    <TouchableOpacity
                      onPress={async () => {
                        const valor = parseInt(quantidadeEditar);
                        if (isNaN(valor) || valor <= 0) {
                          Alert.alert("Erro", "Quantidade inválida");
                          return;
                        }
                        try {
                          await EstoqueService.aumentarQuantidade(editarId, valor);
                          setEditarId(null);
                          setQuantidadeEditar("");
                        } catch (error) {
                          Alert.alert("Erro", error.message);
                        }
                      }}
                      style={[styles.botaoSalvar, { backgroundColor: "#10b981", marginRight: 5 }]}
                    >
                      <Text style={styles.textoBotao}>+ Adicionar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        const valor = parseInt(quantidadeEditar);
                        if (isNaN(valor) || valor <= 0) {
                          Alert.alert("Erro", "Quantidade inválida");
                          return;
                        }
                        try {
                          await EstoqueService.diminuirQuantidade(editarId, valor);
                          setEditarId(null);
                          setQuantidadeEditar("");
                        } catch (error) {
                          Alert.alert("Erro", error.message);
                        }
                      }}
                      style={[styles.botaoCancelar, { marginLeft: 5 }]}
                    >
                      <Text style={styles.textoBotao}>- Diminuir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text>Quantidade atual: {item.quantidade}</Text>
              )}

              {/* Botões admin */}
              <View style={styles.botoesAdmin}>
                {editarId !== item.id && (
                  <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.botaoEditar}>
                    <Text style={styles.textoBotao}>Editar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleExcluirProduto(item)} style={styles.botaoExcluir}>
                  <Text style={styles.textoBotao}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
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
  containerAdicionar: { marginBottom: 16 },
  inputAdicionar: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  botaoAdicionar: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12
  },
  botaoCancelar: {
    backgroundColor: "#e74c3c",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  textoBotao: { color: "#fff", fontWeight: "bold", textAlign: "center" },
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
  botaoBusca: { backgroundColor: "#2e86de", borderRadius: 6 },
  botaoBuscaTexto: { color: "#fff", padding: 10, textAlign: "center" },
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
  cardCritico: {
    backgroundColor: "#fdebd0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  nome: { fontWeight: "bold", fontSize: 16 },
  botoesAdmin: { flexDirection: "row", marginTop: 8 },
  botaoEditar: { backgroundColor: "#f1c40f", padding: 6, borderRadius: 6, marginRight: 8 },
  botaoExcluir: { backgroundColor: "#e74c3c", padding: 6, borderRadius: 6 },
  inputEditar: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 6,
    width: 80,
    marginRight: 8,
  },
  botaoSalvar: {
    backgroundColor: "#10b981",
    padding: 6,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
});
