import { useState, useContext } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
        email: email.trim(), // Limpiamos espacios accidentales
        password,
      });

      // Guardamos el token y los datos del usuario (id_usuario, nombre, rol, puntos)
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>TravelHub</Text>
        <Text style={styles.subtitle}>¡Listo para Viajar!</Text>

        <View style={styles.card}>
          <InputField
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={styles.passwordWrapper}>
            <InputField
              placeholder="Contraseña"
              secureTextEntry={!visible}
              value={password}
              onChangeText={setPassword}
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
    // Sombra para iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Elevación para Android
    elevation: 5,
  },
  // ESTILOS PARA EL OJO
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
    color: COLORS.textGray || "#6B7280",
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});