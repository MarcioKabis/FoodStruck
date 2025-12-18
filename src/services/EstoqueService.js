// EstoqueService.js
// Service completo para gerenciamento de estoque (Firestore v9+)

import {
  estoqueCollection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  db,
} from "./firebase";

/**
 * Estrutura padrão de um item de estoque:
 * {
 *   nome: string,
 *   descricao: string,
 *   quantidade: number,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

// =========================
// CREATE
// =========================

export async function criarProdutoEstoque({ nome, descricao, quantidade }) {
  if (!nome) throw new Error("Nome do produto é obrigatório");

  const payload = {
    nome,
    descricao: descricao || "",
    quantidade: Number(quantidade) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(estoqueCollection, payload);
  return docRef.id;
}

// =========================
// READ
// =========================

// Listar todos os produtos (uma vez)
export async function listarEstoque() {
  const q = query(estoqueCollection, orderBy("nome"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

// Listener em tempo real
export function ouvirEstoque(callback) {
  const q = query(estoqueCollection, orderBy("nome"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    callback(lista);
  });

  return unsubscribe;
}

// Buscar produto por ID
export async function buscarProdutoPorId(id) {
  const ref = doc(db, "estoque", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

// Buscar produtos por nome (client-side)
export async function buscarProdutoPorNome(nomeBusca) {
  const q = query(estoqueCollection, orderBy("nome"));
  const snapshot = await getDocs(q);

  const termo = nomeBusca.toLowerCase();

  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((item) => item.nome.toLowerCase().includes(termo));
}

// =========================
// UPDATE
// =========================

// Atualizar dados do produto
export async function atualizarProduto(id, dados) {
  const ref = doc(db, "estoque", id);

  await updateDoc(ref, {
    ...dados,
    updatedAt: serverTimestamp(),
  });
}

// Aumentar quantidade
export async function aumentarQuantidade(id, valor = 1) {
  const ref = doc(db, "estoque", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Produto não encontrado");

  const quantidadeAtual = snap.data().quantidade || 0;

  await updateDoc(ref, {
    quantidade: quantidadeAtual + valor,
    updatedAt: serverTimestamp(),
  });
}

// Diminuir quantidade (não deixa ficar negativa)
export async function diminuirQuantidade(id, valor = 1) {
  const ref = doc(db, "estoque", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Produto não encontrado");

  const quantidadeAtual = snap.data().quantidade || 0;
  const novaQuantidade = Math.max(0, quantidadeAtual - valor);

  await updateDoc(ref, {
    quantidade: novaQuantidade,
    updatedAt: serverTimestamp(),
  });
}

// =========================
// DELETE
// =========================

export async function excluirProduto(id) {
  const ref = doc(db, "estoque", id);
  await deleteDoc(ref);
}

// =========================
// EXPORT PADRÃO (OPCIONAL)
// =========================

const EstoqueService = {
  criarProdutoEstoque,
  listarEstoque,
  ouvirEstoque,
  buscarProdutoPorId,
  buscarProdutoPorNome,
  atualizarProduto,
  aumentarQuantidade,
  diminuirQuantidade,
  excluirProduto,
};

export default EstoqueService;
