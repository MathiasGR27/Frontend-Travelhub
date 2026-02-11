import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function RegisterScreen({ navigation }) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const visiblePassword = () => {
    setVisible(!visible);
  };

  const handleRegister = async () => {
    if (!nombreCompleto || !telefono || !email || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        nombre_completo: nombreCompleto,
        telefono: telefono,
        email: email,
        password: password,
      });

      Alert.alert("¡Éxito!", "Cuenta creada correctamente", [
        { text: "Ir al Login", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Error al registrar";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.logo}>TravelHub</Text>
      <Text style={styles.subtitle}>Crea tu cuenta de viajero</Text>

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

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Registrarse ahora"
            onPress={handleRegister}
            loading={loading}
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7}
          style={styles.footerClickable}
        >
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
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