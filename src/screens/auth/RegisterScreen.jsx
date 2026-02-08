import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("USER"); // 👈 rol por defecto
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        nombre: name, // 👈 CLAVE: backend espera "nombre"
        email,
        password,
        rol,
      });

      Alert.alert("Éxito", "Cuenta creada correctamente", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log("ERROR REGISTER 👉", error.response?.data || error.message);
      Alert.alert(
        "Error al registrar",
        JSON.stringify(error.response?.data || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TravelHub</Text>
      <Text style={styles.subtitle}>Crea tu cuenta</Text>

      <View style={styles.card}>
        <InputField
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
        />

        <InputField
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* ===== SELECTOR DE ROL ===== */}
        <Text style={styles.roleLabel}>Tipo de cuenta</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              rol === "USER" && styles.roleActive,
            ]}
            onPress={() => setRol("USER")}
          >
            <Text
              style={[
                styles.roleText,
                rol === "USER" && styles.roleTextActive,
              ]}
            >
              Usuario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              rol === "ADMIN" && styles.roleActive,
            ]}
            onPress={() => setRol("ADMIN")}
          >
            <Text
              style={[
                styles.roleText,
                rol === "ADMIN" && styles.roleTextActive,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
        />

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================== ESTILOS ================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.lightGray,
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
  },
  loginText: {
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },

  /* ===== ROLES ===== */
  roleLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginHorizontal: 5,
    alignItems: "center",
  },
  roleActive: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  roleTextActive: {
    color: COLORS.white,
  },
});