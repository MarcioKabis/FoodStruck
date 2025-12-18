// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
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
} from "firebase/firestore";

// 🔹 Autenticação (SEM EXECUTAR LOGIN AQUI)
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4ySsO2_R2kzEg7DtbuCGzLGEJ1LQlRbc",
  authDomain: "projetofinal2-2f22f.firebaseapp.com",
  projectId: "projetofinal2-2f22f",
  storageBucket: "projetofinal2-2f22f.firebasestorage.app",
  messagingSenderId: "807933272334",
  appId: "1:807933272334:web:12361c905399125906b75f",
};

// Initialize Firebase (SOMENTE INICIALIZAÇÃO)
const app = initializeApp(firebaseConfig);

// Instâncias
const db = getFirestore(app);
const auth = getAuth(app);

// Coleções (tabelas)
const usuariosCollection = collection(db, "usuarios");
const produtosCollection = collection(db, "produtos");
const estoqueCollection = collection(db, "estoque");
const comandasCollection = collection(db, "comandas");
const pedidosCollection = collection(db, "pedidos");
const itensPedidoCollection = collection(db, "itens_pedido");
const caixaCollection = collection(db, "caixa");
const movimentacoesCaixaCollection = collection(db, "movimentacoes_caixa");

// Exports
export {
  db,
  auth,
  usuariosCollection,
  produtosCollection,
  estoqueCollection,
  comandasCollection,
  pedidosCollection,
  itensPedidoCollection,
  caixaCollection,
  movimentacoesCaixaCollection,
  collection,
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
};
