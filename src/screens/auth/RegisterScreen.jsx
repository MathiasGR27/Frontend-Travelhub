import AntDesign from "@expo/vector-icons/AntDesign";
import { useRoute } from "@react-navigation/native"; // IMPORTANTE: Añade esto
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function RegisterScreen({ navigation }) {
  const route = useRoute();
  // Detectamos si venimos del panel de Admin
  const isAdminCreator = route.params?.isAdminCreator || false;

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const visiblePassword = () => setVisible(!visible);

  const handleRegister = async () => {
    if (!nombreCompleto || !telefono || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      // ENDPOINT DINÁMICO: Si es admin usa /crearAdmin, si no /register
      const endpoint = isAdminCreator ? "/auth/crear-admin" : "/auth/register";

      await api.post(endpoint, {
        nombre_completo: nombreCompleto,
        telefono: telefono,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      });

      const successMsg = isAdminCreator
        ? "Nuevo administrador registrado"
        : "Cuenta creada correctamente";

      Alert.alert("¡Éxito!", successMsg, [
        {
          text: "OK",
          onPress: () => isAdminCreator ? navigation.goBack() : navigation.navigate("Login")
        },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Error en la operación";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.logo}>TravelHub</Text>
      {/* SUBTÍTULO DINÁMICO */}
      <Text style={styles.subtitle}>
        {isAdminCreator ? "Registro de Personal Administrativo" : "Crea tu cuenta de viajero"}
      </Text>

      <View style={styles.card}>
        <InputField
          placeholder="Nombre completo"
          value={nombreCompleto}
          onChangeText={setNombreCompleto}
        />

        <InputField
          placeholder="Teléfono móvil"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

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
          <TouchableOpacity onPress={visiblePassword} style={styles.eyeButton}>
            <AntDesign name={visible ? "eye" : "eye-invisible"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordWrapper}>
          <InputField
            placeholder="Repetir contraseña"
            secureTextEntry={!visible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={visiblePassword} style={styles.eyeButton}>
            <AntDesign name={visible ? "eye" : "eye-invisible"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {confirmPassword.length > 0 && password !== confirmPassword && (
          <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
        )}

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isAdminCreator ? "Registrar Admin" : "Registrarse ahora"}
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        {/* OCULTAR LOGIN LINK SI ES ADMIN */}
        {!isAdminCreator && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.footerClickable}
          >
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  passwordWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 5,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginLeft: 5,
    marginBottom: 10,
  },
  buttonContainer: {
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
  loginLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});