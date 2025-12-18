import { produtosCollection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "./firebase";

// ==============================
// LISTAR TODOS OS PRODUTOS
// ==============================
export const listarProdutos = async () => {
  try {
    const snapshot = await getDocs(produtosCollection);
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return produtos;
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    throw error;
  }
};

// ==============================
// CRIAR PRODUTO
// ==============================
export const criarProduto = async ({ nome, descricao, categoria, preco }) => {
  try {
    const docRef = await addDoc(produtosCollection, {
      nome,
      descricao,
      categoria,
      preco: parseFloat(preco),
      criadoEm: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
};

// ==============================
// ATUALIZAR PREÇO DE UM PRODUTO
// ==============================
export const atualizarPreco = async (id, novoPreco) => {
  try {
    const produtoRef = doc(produtosCollection.firestore, "produtos", id);
    await updateDoc(produtoRef, { preco: parseFloat(novoPreco) });
  } catch (error) {
    console.error("Erro ao atualizar preço:", error);
    throw error;
  }
};

// ==============================
// EXCLUIR PRODUTO
// ==============================
export const excluirProduto = async (id) => {
  try {
    const produtoRef = doc(produtosCollection.firestore, "produtos", id);
    await deleteDoc(produtoRef);
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    throw error;
  }
};
