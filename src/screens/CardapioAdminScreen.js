import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import Loading from "../components/Loading";
import {
  listarProdutos,
  criarProduto,
  atualizarPreco,
  excluirProduto,
} from "../services/ProdutosService";

export default function CardapioAdminScreen() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalEditar, setModalEditar] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [novoPreco, setNovoPreco] = useState("");

  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
  });

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

  // Funções Admin
  const abrirModalEditarPreco = (produto) => {
    setProdutoSelecionado(produto);
    setNovoPreco(produto.preco.toString());
    setModalEditar(true);
  };

  const salvarPreco = async () => {
    if (!novoPreco || isNaN(novoPreco)) {
      alert("Preço inválido.");
      return;
    }

    try {
      await atualizarPreco(produtoSelecionado.id, parseFloat(novoPreco));
      setModalEditar(false);
      setProdutoSelecionado(null);
      setNovoPreco("");
      carregarProdutos();
      alert("Preço atualizado!");
    } catch (error) {
      alert("Erro ao atualizar preço.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;
    try {
      await excluirProduto(id);
      carregarProdutos();
      alert("Produto removido!");
    } catch (error) {
      alert("Erro ao remover produto.");
    }
  };

  const salvarProduto = async () => {
    const { nome, descricao, categoria, preco } = novoProduto;
    if (!nome || !categoria || !preco || isNaN(preco)) {
      alert(
        "Preencha todos os campos obrigatórios corretamente (nome, categoria e preço)."
      );
      return;
    }

    try {
      await criarProduto({
        nome,
        descricao: descricao || "", // descrição agora é opcional
        categoria,
        preco: parseFloat(preco),
      });
      setModalAdicionar(false);
      setNovoProduto({ nome: "", descricao: "", categoria: "", preco: "" });
      carregarProdutos();
      alert("Produto adicionado!");
    } catch (error) {
      alert("Erro ao adicionar produto.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Botão adicionar produto */}
      <View style={{ padding: 16, alignItems: "center" }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#10B981" }]}
          onPress={() => setModalAdicionar(true)}
        >
          <Text style={styles.buttonText}>➕ Adicionar Produto</Text>
        </TouchableOpacity>
      </View>

      {categorias.map((categoria) => (
        <View key={categoria} style={styles.categoriaCard}>
          <Text style={styles.categoriaTitle}>{categoria}</Text>
          {produtos
            .filter((p) => p.categoria === categoria)
            .map((produto) => (
              <View key={produto.id} style={styles.produtoCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.produtoNome}>{produto.nome}</Text>
                  {produto.descricao ? (
                    <Text style={styles.produtoDescricao}>
                      {produto.descricao}
                    </Text>
                  ) : null}
                  <Text style={styles.produtoPreco}>
                    R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                {/* Botões Admin */}
                <View style={styles.produtoButtons}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#2563EB" }]}
                    onPress={() => abrirModalEditarPreco(produto)}
                  >
                    <Text style={styles.buttonText}>Editar Preço</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#DC2626" }]}
                    onPress={() => handleDelete(produto.id)}
                  >
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      ))}

      {/* Modal Editar Preço */}
      {modalEditar && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Preço</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={novoPreco}
              onChangeText={setNovoPreco}
              placeholder="Novo preço"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6B7280" }]}
                onPress={() => setModalEditar(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#2563EB" }]}
                onPress={salvarPreco}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal Adicionar Produto */}
      {modalAdicionar && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Produto</Text>

            <TextInput
              style={styles.input}
              value={novoProduto.nome}
              onChangeText={(text) =>
                setNovoProduto({ ...novoProduto, nome: text })
              }
              placeholder="Nome"
            />
            <TextInput
              style={styles.input}
              value={novoProduto.descricao}
              onChangeText={(text) =>
                setNovoProduto({ ...novoProduto, descricao: text })
              }
              placeholder="Descrição (opcional)"
            />
            <TextInput
              style={styles.input}
              value={novoProduto.categoria}
              onChangeText={(text) =>
                setNovoProduto({ ...novoProduto, categoria: text })
              }
              placeholder="Categoria"
            />
            <TextInput
              style={styles.input}
              value={novoProduto.preco}
              onChangeText={(text) =>
                setNovoProduto({ ...novoProduto, preco: text })
              }
              placeholder="Preço"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6B7280" }]}
                onPress={() => setModalAdicionar(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#10B981" }]}
                onPress={salvarProduto}
              >
                <Text style={styles.buttonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  categoriaCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  produtoNome: { fontSize: 16, fontWeight: "600", color: "#111827" },
  produtoDescricao: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  produtoPreco: { fontSize: 14, color: "#111827", marginTop: 4, fontWeight: "500" },
  produtoButtons: { flexDirection: "row", gap: 8 },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, cursor: "pointer" },
  buttonText: { color: "#FFF", fontWeight: "600" },

  modalContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
});
