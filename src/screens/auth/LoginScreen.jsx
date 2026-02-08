import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { saveToken } from "../../services/token.service";
import { COLORS } from "../../styles/constants/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      await saveToken(data.token);

      navigation.replace("Home");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Credenciales inválidas"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TravelHub</Text>

      <View style={styles.card}>
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

        <PrimaryButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
        />

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? Regístrate
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
  },
  registerText: {
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});