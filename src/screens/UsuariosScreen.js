import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from "react-native";

import {
  cadastrarUsuario,
  listarUsuarios,
  buscarUsuariosPorNomeOuCpf,
  atualizarUsuario,
  excluirUsuario,
} from "../services/UsuariosService";

/* =====================
   VALIDAÇÃO DE CPF
===================== */
function validarCPF(cpf) {
  if (!cpf) return false;

  cpf = cpf.replace(/[^\d]+/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    login: "",
    senha: "",
  });

  const carregarUsuarios = async () => {
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
    } catch (e) {
      window.alert("Erro ao carregar usuários");
      console.error(e);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirCadastro = () => {
    setForm({
      id: null,
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      login: "",
      senha: "",
    });
    setModalVisible(true);
  };

  const abrirEdicao = (usuario) => {
    setForm(usuario);
    setModalEditar(true);
  };

  /* =====================
     SALVAR CADASTRO
  ===================== */
  const salvarCadastro = async () => {
    if (!form.nome || !form.cpf || !form.login || !form.senha) {
      window.alert("Preencha os campos obrigatórios");
      return;
    }

    if (!validarCPF(form.cpf)) {
      window.alert("CPF inválido");
      return;
    }

    try {
      await cadastrarUsuario({
        ...form,
        cpf: form.cpf.replace(/[^\d]+/g, ""),
      });

      window.alert("Usuário cadastrado com sucesso");
      setModalVisible(false);
      carregarUsuarios();
    } catch (e) {
      window.alert("Erro ao cadastrar usuário");
      console.error(e);
    }
  };

  /* =====================
     SALVAR EDIÇÃO
  ===================== */
  const salvarEdicao = async () => {
    if (!validarCPF(form.cpf)) {
      window.alert("CPF inválido");
      return;
    }

    try {
      await atualizarUsuario(form.id, {
        ...form,
        cpf: form.cpf.replace(/[^\d]+/g, ""),
      });

      window.alert("Usuário atualizado com sucesso");
      setModalEditar(false);
      carregarUsuarios();
    } catch (e) {
      window.alert("Erro ao atualizar usuário");
      console.error(e);
    }
  };

  const buscar = async () => {
    if (!busca) return carregarUsuarios();

    try {
      const resultado = await buscarUsuariosPorNomeOuCpf(busca);
      setUsuarios(resultado);
    } catch (e) {
      window.alert("Erro na busca");
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuários</Text>

      {/* BUSCA */}
      <View style={styles.row}>
        <TextInput
          placeholder="Buscar por nome ou CPF"
          value={busca}
          onChangeText={setBusca}
          style={styles.input}
        />
        <TouchableOpacity style={styles.btnBuscar} onPress={buscar}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* CADASTRAR */}
      <TouchableOpacity style={styles.btnAdd} onPress={abrirCadastro}>
        <Text style={styles.btnText}>+ Cadastrar Usuário</Text>
      </TouchableOpacity>

      {/* LISTA */}
      {usuarios.length === 0 ? (
        <Text style={styles.empty}>Nenhum usuário cadastrado</Text>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>CPF: {item.cpf}</Text>
              <Text>Login: {item.login}</Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => abrirEdicao(item)}>
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    const confirmar = window.confirm(
                      "Deseja realmente excluir este usuário?"
                    );
                    if (!confirmar) return;

                    try {
                      await excluirUsuario(item.id);
                      window.alert("Usuário excluído com sucesso");
                      carregarUsuarios();
                    } catch (e) {
                      window.alert("Erro ao excluir usuário");
                      console.error(e);
                    }
                  }}
                >
                  <Text style={styles.excluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* MODAL CADASTRO */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Cadastrar Usuário</Text>

          {["nome", "cpf", "email", "telefone", "login", "senha"].map((c) => (
            <TextInput
              key={c}
              placeholder={c.toUpperCase()}
              value={form[c]}
              onChangeText={(v) => setForm({ ...form, [c]: v })}
              style={styles.input}
              secureTextEntry={c === "senha"}
            />
          ))}

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarCadastro}>
            <Text style={styles.btnText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL EDITAR */}
      <Modal visible={modalEditar} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Editar Usuário</Text>

          {["nome", "cpf", "email", "telefone", "login", "senha"].map((c) => (
            <TextInput
              key={c}
              placeholder={c.toUpperCase()}
              value={form[c]}
              onChangeText={(v) => setForm({ ...form, [c]: v })}
              style={styles.input}
            />
          ))}

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao}>
            <Text style={styles.btnText}>Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            onPress={() => setModalEditar(false)}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginBottom: 8,
  },
  btnBuscar: { backgroundColor: "#2980b9", padding: 10, marginLeft: 5 },
  btnAdd: { backgroundColor: "#27ae60", padding: 12, marginBottom: 10 },
  btnSalvar: { backgroundColor: "#27ae60", padding: 12, marginTop: 10 },
  btnCancelar: { backgroundColor: "#999", padding: 12, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center" },
  empty: { textAlign: "center", marginTop: 20 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
  nome: { fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  editar: { color: "#2980b9" },
  excluir: { color: "#c0392b" },
  modal: { padding: 20 },
});
