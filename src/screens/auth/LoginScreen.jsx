import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import api from "../../services/api";
import { saveToken } from "../../services/token.service";
import { COLORS } from "../../styles/constants/colors";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";

export default function LoginScreen() {
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
      const response = await api.post("/auth/login", { email, password });
      await saveToken(response.data.token);
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
      <Text style={styles.subtitle}>Tu próxima aventura</Text>

      <View style={styles.card}>
        <InputField
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
        />
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
});