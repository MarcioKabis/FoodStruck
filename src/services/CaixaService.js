import {
  caixaCollection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  db,
} from "../services/firebase";

import * as UsuarioService from "./UsuarioService"; // para buscar usuário

export default {
  /**
   * Abrir caixa
   * usuarioId: id do usuário que vai abrir o caixa
   * totalInicial: valor inicial em dinheiro/cartão
   */
  async abrirCaixa({ usuarioId, totalInicial = 0 }) {
    if (!usuarioId) throw new Error("Usuário inválido para abrir caixa");

    // buscar usuário no UsuarioService
    const usuario = await UsuarioService.buscarUsuarioPorId(usuarioId);
    if (!usuario) throw new Error("Usuário não encontrado");

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split("T")[0]; // YYYY-MM-DD
    const horaFormatada = dataAtual.toTimeString().split(" ")[0]; // HH:MM:SS

    const novoCaixa = {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        cpf: usuario.cpf,
      },
      dataAbertura: dataFormatada,
      horaAbertura: horaFormatada,
      dataFechamento: null,
      horaFechamento: null,
      total: totalInicial,
      status: "aberto",
      criadoEm: serverTimestamp(),
    };

    const docRef = await addDoc(caixaCollection, novoCaixa);
    return { id: docRef.id, ...novoCaixa };
  },

  /**
   * Fechar caixa
   * caixaId: id do caixa a ser fechado
   * totalFinal: total final do caixa
   */
  async fecharCaixa(caixaId, totalFinal = 0) {
    if (!caixaId) throw new Error("Caixa inválido");

    const caixaRef = doc(db, "caixa", caixaId);

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split("T")[0];
    const horaFormatada = dataAtual.toTimeString().split(" ")[0];

    await updateDoc(caixaRef, {
      dataFechamento: dataFormatada,
      horaFechamento: horaFormatada,
      total: totalFinal,
      status: "fechado",
      fechadoEm: serverTimestamp(),
    });

    return true;
  },

  /**
   * Retorna o caixa atualmente aberto
   */
  async caixaAberto() {
    const q = query(
      caixaCollection,
      where("status", "==", "aberto"),
      orderBy("criadoEm", "desc")
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const caixa = snapshot.docs[0];
      return { id: caixa.id, ...caixa.data() };
    }

    return null;
  },

  /**
   * Buscar todos os caixas (histórico)
   */
  async buscarTodosCaixas() {
    const q = query(caixaCollection, orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Atualizar total do caixa (ex: adicionar movimentações)
   */
  async atualizarTotal(caixaId, novoTotal) {
    const caixaRef = doc(db, "caixa", caixaId);
    await updateDoc(caixaRef, {
      total: novoTotal,
      atualizadoEm: serverTimestamp(),
    });
    return true;
  },
};

