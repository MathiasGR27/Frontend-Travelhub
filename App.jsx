import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "./src/styles/constants/colors";

// --- IMPORTACIONES PARA CACHÉ OFFLINE ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PANTALLAS (Tus importaciones se mantienen igual...)
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import HomeScreen from "./src/screens/app/HomeScreen";
import BuscarVuelosScreen from "./src/screens/app/BuscarVuelosScreen";
import MisReservasScreen from "./src/screens/app/MisReservasScreen";
import PasajeroScreen from "./src/screens/app/PasajeroScreen";
import ReservaAgregadaScreen from "./src/screens/app/ReservaAgregadaScreen";
import PerfilScreen from "./src/screens/app/PerfilScreen";
import ValidarQRScreen from "./src/screens/app/ValidarQRScreen";
import AdminVuelosScreen from "./src/screens/app/AdminVuelosScreen";
import FormVueloScreen from "./src/screens/app/FormVueloScreen";
import MetodoPagoScreen from "./src/screens/app/MetodoPagoScreen";
import GestionReservasScreen from "./src/screens/app/GestionReservasScreen";

// 1. CONFIGURACIÓN DEL CLIENTE DE CONSULTAS (EL BAÚL)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // Mantener en memoria 24 horas
      staleTime: 1000 * 60 * 5,    // Los datos se consideran "nuevos" por 5 min
      retry: 2,                    // Reintentar 2 veces si falla la red
    },
  },
});

// 2. CONFIGURACIÓN DE PERSISTENCIA (PARA QUE SE GUARDE EN EL DISCO)
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
});

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryDark }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />

          {user.rol === "USER" && (
            <>
              <Stack.Screen name="BuscarVuelos" component={BuscarVuelosScreen} />
              <Stack.Screen name="MisReservas" component={MisReservasScreen} />
              <Stack.Screen name="Pasajero" component={PasajeroScreen} />
              <Stack.Screen name="ReservaAgregada" component={ReservaAgregadaScreen} />
              <Stack.Screen name="MetodoPago" component={MetodoPagoScreen} />
            </>
          )}

          {user.rol === "ADMIN" && (
            <>
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ValidarQR" component={ValidarQRScreen} />
              <Stack.Screen name="AdminVuelos" component={AdminVuelosScreen} />
              <Stack.Screen name="FormVuelo" component={FormVueloScreen} />
              <Stack.Screen name="GestionReservas" component={GestionReservasScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

// 3. EXPORTAR CON EL PROVIDER DE QUERY
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}