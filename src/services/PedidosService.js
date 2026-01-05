import {
  pedidosCollection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  db,
} from "../services/firebase"; // ⚠️ AJUSTE O PATH

/* =========================
   CRIAR PEDIDO
========================= */
export const criarPedido = async ({
  usuarioId,
  caixaId,
  total,
  itens = [],
  formaPagamento,
}) => {
  try {
    if (!usuarioId) throw new Error("usuarioId não informado");
    if (!caixaId) throw new Error("caixaId não informado");
    if (!Array.isArray(itens) || itens.length === 0)
      throw new Error("Pedido sem itens");
    if (!formaPagamento) throw new Error("Forma de pagamento não informada");

    const agora = new Date();

    const pedido = {
      usuarioId,
      caixaId,
      data: agora.toLocaleDateString("pt-BR"),
      hora: agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: Number(total) || 0,
      formaPagamento,
      itens: itens.map((item) => ({
        produtoId: item.id,
        nome: item.nome,
        quantidade: Number(item.quantidade) || 1,
        preco: Number(item.preco) || 0,
        subtotal:
          Number(item.preco || 0) * Number(item.quantidade || 1),
      })),
      criadoEm: serverTimestamp(),
    };

    const docRef = await addDoc(pedidosCollection, pedido);

    console.log("✅ Pedido salvo:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    throw error;
  }
};

/* =========================
   LISTAR PEDIDOS
========================= */
export const listarPedidos = async () => {
  try {
    const snapshot = await getDocs(pedidosCollection);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error("❌ Erro ao listar pedidos:", error);
    return [];
  }
};

/* =========================
   ATUALIZAR PEDIDO
========================= */
export const atualizarPedido = async (id, dados) => {
  if (!id) throw new Error("ID do pedido não informado");
  const ref = doc(db, "pedidos", id);
  return updateDoc(ref, dados);
};

/* =========================
   EXCLUIR PEDIDO
========================= */
export const excluirPedido = async (id) => {
  if (!id) throw new Error("ID do pedido não informado");
  const ref = doc(db, "pedidos", id);
  return deleteDoc(ref);
};
