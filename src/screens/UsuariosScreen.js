import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
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
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

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
    senha: "",
  });

  const [erroCPF, setErroCPF] = useState("");

  const carregarUsuarios = async () => {
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
    } catch (e) {
      Alert.alert("Erro ao carregar usuários");
      console.error(e);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const abrirCadastro = () => {
    setForm({ id: null, nome: "", cpf: "", senha: "" });
    setErroCPF("");
    setModalVisible(true);
  };

  const abrirEdicao = (usuario) => {
    setForm(usuario);
    setErroCPF("");
    setModalEditar(true);
  };

  // Debounce na verificação de CPF
  useEffect(() => {
    if (!form.cpf) return;
    const timeout = setTimeout(() => verificarCPF(form.cpf), 300);
    return () => clearTimeout(timeout);
  }, [form.cpf]);

  const verificarCPF = async (cpfDigitado) => {
    const cpfLimpo = cpfDigitado.replace(/\D/g, "");
    if (!validarCPF(cpfLimpo)) {
      setErroCPF("CPF inválido");
      return;
    }

    try {
      const usuariosExistentes = await listarUsuarios();
      const cpfDuplicado = usuariosExistentes.some(
        (u) => u.cpf === cpfLimpo && u.id !== form.id
      );
      setErroCPF(cpfDuplicado ? "CPF já cadastrado" : "");
    } catch (e) {
      console.error(e);
    }
  };

  const salvarCadastro = async () => {
    if (!form.nome || !form.cpf || !form.senha) {
      Alert.alert("Preencha os campos obrigatórios");
      return;
    }
    if (erroCPF) {
      Alert.alert("Corrija o CPF antes de salvar");
      return;
    }

    try {
      await cadastrarUsuario({
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        senha: form.senha,
      });

      Alert.alert("Usuário cadastrado com sucesso");
      setModalVisible(false);
      carregarUsuarios();
    } catch (e) {
      console.error(e);
      Alert.alert("Erro ao cadastrar usuário");
    }
  };

  const salvarEdicao = async () => {
    if (erroCPF) {
      Alert.alert("Corrija o CPF antes de salvar");
      return;
    }

    try {
      await atualizarUsuario(form.id, {
        nome: form.nome,
        cpf: form.cpf.replace(/\D/g, ""),
        senha: form.senha,
      });

      Alert.alert("Usuário atualizado com sucesso");
      setModalEditar(false);
      carregarUsuarios();
    } catch (e) {
      console.error(e);
      Alert.alert("Erro ao atualizar usuário");
    }
  };

  const buscar = async () => {
    if (!busca) return carregarUsuarios();
    try {
      const resultado = await buscarUsuariosPorNomeOuCpf(busca);
      setUsuarios(resultado);
    } catch (e) {
      Alert.alert("Erro na busca");
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

      <TouchableOpacity style={styles.btnAdd} onPress={abrirCadastro}>
        <Text style={styles.btnText}>+ Cadastrar Usuário</Text>
      </TouchableOpacity>

      {/* LISTA */}
      {usuarios.length === 0 ? (
        <Text style={styles.empty}>Nenhum usuário cadastrado</Text>
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {usuarios.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text>CPF: {item.cpf}</Text>
              <Text>Senha: {item.senha}</Text> {/* <-- senha agora aparece */}

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => abrirEdicao(item)}>
                  <Text style={styles.editar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Confirmação",
                      "Deseja realmente excluir este usuário?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "OK",
                          onPress: async () => {
                            try {
                              await excluirUsuario(item.id);
                              Alert.alert("Usuário excluído com sucesso");
                              carregarUsuarios();
                            } catch (e) {
                              Alert.alert("Erro ao excluir usuário");
                              console.error(e);
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.excluir}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* MODAL CADASTRO */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Cadastrar Usuário</Text>

          {["nome", "cpf", "senha"].map((c) => (
            <View key={c} style={{ marginBottom: 10 }}>
              <TextInput
                placeholder={c.toUpperCase()}
                value={form[c]}
                onChangeText={(v) => setForm({ ...form, [c]: v })}
                style={styles.input}
                secureTextEntry={c === "senha"}
              />
              {c === "cpf" && erroCPF ? (
                <Text style={styles.erro}>{erroCPF}</Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btnSalvar, erroCPF && styles.btnDisabled]}
            onPress={salvarCadastro}
            disabled={!!erroCPF}
          >
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

          {["nome", "cpf", "senha"].map((c) => (
            <View key={c} style={{ marginBottom: 10 }}>
              <TextInput
                placeholder={c.toUpperCase()}
                value={form[c]}
                onChangeText={(v) => setForm({ ...form, [c]: v })}
                style={styles.input}
                secureTextEntry={c === "senha"}
              />
              {c === "cpf" && erroCPF ? (
                <Text style={styles.erro}>{erroCPF}</Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btnSalvar, erroCPF && styles.btnDisabled]}
            onPress={salvarEdicao}
            disabled={!!erroCPF}
          >
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
  },
  btnBuscar: { backgroundColor: "#2980b9", padding: 10, marginLeft: 5 },
  btnAdd: { backgroundColor: "#27ae60", padding: 12, marginBottom: 10 },
  btnSalvar: { backgroundColor: "#27ae60", padding: 12, marginTop: 10 },
  btnCancelar: { backgroundColor: "#999", padding: 12, marginTop: 8 },
  btnText: { color: "#fff", textAlign: "center" },
  btnDisabled: { backgroundColor: "#999" },
  empty: { textAlign: "center", marginTop: 20 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 8,
    borderRadius: 5,
  },
  nome: { fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  editar: { color: "#2980b9" },
  excluir: { color: "#c0392b" },
  modal: { padding: 20, flex: 1, justifyContent: "center" },
  erro: { color: "red", marginTop: 2 },
});
