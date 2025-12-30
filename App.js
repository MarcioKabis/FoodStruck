import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { auth } from "./src/services/firebase";

// COMPONENTES
import Loading from "./src/components/Loading";

// TELAS
import HomeScreen from "./src/screens/HomeScreen";
import CardapioScreen from "./src/screens/CardapioScreen";
import EstoqueScreen from "./src/screens/EstoqueScreen";
import CaixaScreen from "./src/screens/CaixaScreen";
import LoginAdminScreen from "./src/screens/LoginAdminScreen";
import HomeAdminScreen from "./src/screens/HomeAdminScreen";
import CardapioAdminScreen from "./src/screens/CardapioAdminScreen";
import EstoqueAdminScreen from "./src/screens/EstoqueAdminScreen";
import CaixaAdminScreen from "./src/screens/CaixaAdminScreen";
import UsuariosScreen from "./src/screens/UsuariosScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Erro no login anônimo:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <Loading text="Inicializando FoodStack..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "FoodStack" }}
          />

          <Stack.Screen
            name="Cardapio"
            component={CardapioScreen}
            options={{ title: "Cardápio" }}
          />

          <Stack.Screen
            name="Estoque"
            component={EstoqueScreen}
            options={{ title: "Estoque" }}
          />

          <Stack.Screen
            name="Caixa"
            component={CaixaScreen}
            options={{ title: "Caixa" }}
          />

          <Stack.Screen
            name="LoginAdmin"
            component={LoginAdminScreen}
            options={{ title: "LoginAdmin" }}
          />

           <Stack.Screen
            name="HomeAdmin"
            component={HomeAdminScreen}
            options={{ title: "HomeAdmin" }}
          />

           <Stack.Screen
            name="CardapioAdmin"
            component={CardapioAdminScreen}
            options={{ title: "CardapioAdmin" }}
          />

          
           <Stack.Screen
            name="EstoqueAdmin"
            component={EstoqueAdminScreen}
            options={{ title: "EstoqueAdmin" }}
          />

          <Stack.Screen
            name="CaixaAdmin"
            component={CaixaAdminScreen}
            options={{ title: "CaixaAdmin" }}
          />
          
            <Stack.Screen
            name="Usuarios"
            component={UsuariosScreen}
            options={{ title: "Usuario" }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
