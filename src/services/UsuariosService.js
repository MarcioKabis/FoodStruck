import {
  usuariosCollection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  db,
} from "../services/firebase";

/**
 * Cadastrar usuário
 */
export async function cadastrarUsuario({
  nome,
  cpf,
  email,
  telefone,
  login,
  senha,
}) {
  try {
    const docRef = await addDoc(usuariosCollection, {
      nome,
      cpf,
      email,
      telefone,
      login,
      senha,
      criadoEm: serverTimestamp(),
    });

    return { id: docRef.id, sucesso: true };
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    throw error;
  }
}

/**
 * Listar todos os usuários
 */
export async function listarUsuarios() {
  try {
    const q = query(usuariosCollection, orderBy("nome"));
    const snapshot = await getDocs(q);

    const usuarios = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return usuarios;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw error;
  }
}

/**
 * Buscar usuário por CPF ou Nome
 */
export async function buscarUsuariosPorNomeOuCpf(busca) {
  try {
    const snapshot = await getDocs(usuariosCollection);

    const usuarios = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (u) =>
          u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
          u.cpf?.includes(busca)
      );

    return usuarios;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
}

/**
 * Buscar usuário por ID
 */
export async function buscarUsuarioPorId(id) {
  try {
    const ref = doc(db, "usuarios", id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;

    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
}

/**
 * Atualizar usuário
 */
export async function atualizarUsuario(id, dadosAtualizados) {
  try {
    const ref = doc(db, "usuarios", id);
    await updateDoc(ref, {
      ...dadosAtualizados,
      atualizadoEm: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

/**
 * Excluir usuário
 */
export async function excluirUsuario(id) {
  try {
    const ref = doc(db, "usuarios", id);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw error;
  }
}
