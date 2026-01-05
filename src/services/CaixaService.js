import {
  caixaCollection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  db,
} from "../services/firebase";

import * as UsuariosService from "./UsuariosService";

export default {
  async abrirCaixa({ usuarioId, totalInicial = 0 }) {
    if (!usuarioId) throw new Error("Usuário inválido");

    const usuario = await UsuariosService.buscarUsuarioPorId(usuarioId);
    if (!usuario) throw new Error("Usuário não encontrado");

    const dataAtual = new Date();
    const dataFormatada = dataAtual.toISOString().split("T")[0];
    const horaFormatada = dataAtual.toTimeString().split(" ")[0];

    const novoCaixa = {
      usuario: { id: usuario.id, nome: usuario.nome, cpf: usuario.cpf },
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

  async fecharCaixa(caixaId, totalFinal = 0) {
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

  async caixaAberto() {
    try {
      const snapshot = await getDocs(caixaCollection);
      if (!snapshot.empty) {
        const caixasAbertos = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(c => c.status === "aberto");

        if (caixasAbertos.length > 0) {
          caixasAbertos.sort((a, b) => {
            const tA = a.criadoEm?.seconds || 0;
            const tB = b.criadoEm?.seconds || 0;
            return tB - tA;
          });
          return caixasAbertos[0];
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar caixa aberto:", error);
      return null;
    }
  },
};
