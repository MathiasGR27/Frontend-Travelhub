import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "./src/styles/constants/colors";

// PANTALLAS DE AUTENTICACIÓN
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";

// PANTALLAS DE APLICACIÓN
import HomeScreen from "./src/screens/app/HomeScreen";
import BuscarVuelosScreen from "./src/screens/app/BuscarVuelosScreen";
import MisReservasScreen from "./src/screens/app/MisReservasScreen";
import PasajeroScreen from "./src/screens/app/PasajeroScreen";
import PagoScreen from "./src/screens/app/ReservaScreen"; 
import PerfilScreen from "./src/screens/app/PerfilScreen";
import ValidarQRScreen from "./src/screens/app/ValidarQRScreen"; 
import AdminVuelosScreen from "./src/screens/app/AdminVuelosScreen"; 
import FormVueloScreen from "./src/screens/app/FormVueloScreen";
import MetodoPagoScreen from "./src/screens/app/MetodoPagoScreen"; 
import GestionReservasScreen from "./src/screens/app/GestionReservasScreen";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  // Pantalla de carga mientras verifica la sesión en AsyncStorage
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
          {/* RUTA COMÚN: Ambos roles entran aquí primero */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />

          {/* RUTAS EXCLUSIVAS PARA USUARIOS (CLIENTES) */}
          {user.rol === "USER" && (
            <>
              <Stack.Screen name="BuscarVuelos" component={BuscarVuelosScreen} />
              <Stack.Screen name="MisReservas" component={MisReservasScreen} />
              <Stack.Screen name="Pasajero" component={PasajeroScreen} />
              <Stack.Screen name="Pago" component={PagoScreen} />
              <Stack.Screen name="MetodoPago" component={MetodoPagoScreen} />
            </>
          )}

          {/* RUTAS EXCLUSIVAS PARA ADMINISTRADORES */}
          {user.rol === "ADMIN" && (
            <>
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

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}