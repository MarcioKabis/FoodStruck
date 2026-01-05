import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CaixaService from "../services/CaixaService";
import * as UsuariosService from "../services/UsuariosService";

export default function AberturaCaixaScreen() {
  const navigation = useNavigation();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [valorInicial, setValorInicial] = useState("0");
  const [loading, setLoading] = useState(false);

  const abrirCaixa = async () => {
    if (!cpf) return Alert.alert("Erro", "Digite o CPF do usuário");
    if (!senha) return Alert.alert("Erro", "Digite a senha do usuário");

    try {
      setLoading(true);

      // Busca todos os usuários e verifica CPF EXATO
      const usuarios = await UsuariosService.listarUsuarios();
      const usuario = usuarios.find(u => u.cpf === cpf);

      if (!usuario) return Alert.alert("Erro", "Usuário não encontrado no sistema");

      // Verifica senha
      if (usuario.senha !== senha) return Alert.alert("Erro", "Senha incorreta");

      // Abrir caixa
      const caixa = await CaixaService.abrirCaixa({
        usuarioId: usuario.id,
        totalInicial: parseFloat(valorInicial) || 0,
      });

      Alert.alert("Sucesso", `Caixa aberto pelo usuário ${usuario.nome}`);
      navigation.replace("Caixa", { caixaId: caixa.id });

    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      Alert.alert("Erro", "Não foi possível abrir o caixa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CPF do Usuário:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Senha:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Text style={styles.label}>Valor Inicial:</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={valorInicial}
        onChangeText={setValorInicial}
        keyboardType="numeric"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Abrir Caixa" onPress={abrirCaixa} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  label: { marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
