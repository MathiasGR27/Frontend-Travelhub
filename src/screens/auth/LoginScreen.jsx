import { useState, useContext } from "react";
import { 
  Alert, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { AuthContext } from "../../context/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const visiblePassword = () => {
    setVisible(!visible);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atención", "Por favor, ingresa tu correo y contraseña");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      await login(data.token, data.usuario);

    } catch (error) {
      console.log("Error Login:", error.response?.data || error.message);
      Alert.alert(
        "Error de acceso",
        error.response?.data?.message || "Revisa tus credenciales e intenta de nuevo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      // FIX: Fondo oscuro aquí para evitar el cuadro blanco al subir el teclado
      style={{ flex: 1, backgroundColor: COLORS.primaryDark }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView 
        // FIX: Asegurar que el ScrollView no tenga fondo blanco por defecto
        style={{ backgroundColor: COLORS.primaryDark }}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>TravelHub</Text>
        <Text style={styles.subtitle}>¡Listo para Viajar!</Text>

        <View style={styles.card}>
          <InputField
            placeholder="Correo electrónico"
            placeholderTextColor="#888" // FIX: Visibilidad del placeholder
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={{ color: "#000" }} // FIX: Texto negro sobre fondo blanco
          />

          <View style={styles.passwordWrapper}>
            <InputField
              placeholder="Contraseña"
              placeholderTextColor="#888" // FIX: Visibilidad del placeholder
              secureTextEntry={!visible}
              value={password}
              onChangeText={setPassword}
              style={{ color: "#000" }} // FIX: Texto negro sobre fondo blanco
            />
            <TouchableOpacity
              onPress={visiblePassword}
              style={styles.eyeButton}
            >
              <AntDesign
                name={visible ? "eye" : "eye-invisible"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonSpace}>
            <PrimaryButton
              title="Iniciar sesión"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.7}
            style={styles.footerClickable}
          >
            <Text style={styles.footerText}>
              ¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.lightGray,
    textAlign: "center",
    marginBottom: 32,
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  passwordWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 2,
  },
  buttonSpace: {
    marginTop: 10,
  },
  footerClickable: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});