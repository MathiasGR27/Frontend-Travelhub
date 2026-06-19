import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, Switch, TextInput, ScrollView
} from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function MetodoPagoScreen({ route, navigation }) {

  const { reserva } = route.params;
  const [metodo, setMetodo] = useState("Tarjeta");
  const [usarPuntos, setUsarPuntos] = useState(false);
  const [puntos, setPuntos] = useState("");
  const [loading, setLoading] = useState(false);

  const [tarjetaNum, setTarjetaNum] = useState("");
  const [fechaVence, setFechaVence] = useState("");
  const [cvv, setCvv] = useState("");

  const { user, actualizarDatosUsuario } = useContext(AuthContext);

  const calcularDescuentoFront = (pts) => {
    if (pts >= 3000) return 0.30;
    if (pts >= 2500) return 0.25;
    if (pts >= 2000) return 0.20;
    if (pts >= 1500) return 0.15;
    if (pts >= 900) return 0.10;
    if (pts >= 450) return 0.05;
    return 0;
  };

  const ptsInput = parseInt(puntos || 0);
  const porcentajeDesc = usarPuntos ? calcularDescuentoFront(ptsInput) : 0;
  const totalConDescuento =
    reserva.total - (reserva.total * porcentajeDesc);

  const ejecutarPago = async () => {
    try {
      setLoading(true);

      const { data } = await api.post("/pagos/confirmar", {
        id_reserva: reserva.id_reserva,
        metodo,
        usar_puntos: usarPuntos,
        puntos_usar: ptsInput
      });

      if (data.puntos_actuales !== undefined) {
        await actualizarDatosUsuario({ puntos: data.puntos_actuales });
      }

      Alert.alert("Pago exitoso", "Reserva confirmada", [
        { text: "OK", onPress: () => navigation.replace("Home") }
      ]);

    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="card-outline" size={28} color="#fff" />
        <Text style={styles.title}>Método de Pago</Text>
      </View>

      <View style={styles.card}>

        {/* RESUMEN */}
        <View style={styles.rowIcon}>
          <Ionicons name="airplane-outline" size={18} color="#111827" />
          <Text style={styles.routeText}>
            {reserva.vuelo?.origen} → {reserva.vuelo?.destino}
          </Text>
        </View>

        <View style={styles.rowIcon}>
          <Ionicons name="cash-outline" size={18} color="#111827" />
          <Text style={styles.priceText}>
            Total: ${reserva.total}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* MÉTODOS */}
        <Text style={styles.label}>Método de pago</Text>

        <View style={styles.row}>
          {["Tarjeta", "Efectivo", "Transferencia"].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.chip,
                metodo === m && styles.chipSelected
              ]}
              onPress={() => setMetodo(m)}
            >
              <Text style={{ color: "#111827" }}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TARJETA */}
        {metodo === "Tarjeta" && (
          <View style={{ marginTop: 20 }}>

            <Text style={styles.label}>Datos de tarjeta</Text>

            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={18} color="#111827" />
              <TextInput
                style={styles.input}
                placeholder="Número de tarjeta"
                keyboardType="numeric"
                maxLength={16}
                value={tarjetaNum}
                onChangeText={setTarjetaNum}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>

              <View style={styles.inputRowSmall}>
                <Ionicons name="calendar-outline" size={18} color="#111827" />
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  value={fechaVence}
                  onChangeText={setFechaVence}
                />
              </View>

              <View style={styles.inputRowSmall}>
                <Ionicons name="lock-closed-outline" size={18} color="#111827" />
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  secureTextEntry
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>

            </View>
          </View>
        )}

        <View style={styles.divider} />

        {/* PUNTOS */}
        <View style={styles.switchRow}>

          <View style={styles.rowIcon}>
            <Ionicons name="star-outline" size={18} color="#111827" />
            <Text style={styles.labelPuntos}>Usar puntos</Text>
          </View>

          <Switch
            value={usarPuntos}
            onValueChange={setUsarPuntos}
          />
        </View>

        {usarPuntos && (
          <TextInput
            style={styles.inputPuntos}
            placeholder="Cantidad de puntos"
            keyboardType="numeric"
            value={puntos}
            onChangeText={setPuntos}
          />
        )}

      </View>

      <PrimaryButton
        title={`Pagar $${totalConDescuento.toFixed(2)}`}
        onPress={ejecutarPago}
        loading={loading}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: COLORS.primaryDark,
    flexGrow: 1
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 40,
    marginBottom: 20
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20
  },

  label: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10
  },

  routeText: {
    color: "#111827",
    fontWeight: "bold",
    fontSize: 16
  },

  priceText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "bold"
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15
  },

  row: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },

  chip: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10
  },

  chipSelected: {
    backgroundColor: COLORS.primary
  },

  rowIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },

  inputRowSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10
  },

  input: {
    flex: 1,
    marginLeft: 5,
    color: "#111827"
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  labelPuntos: {
    color: "#111827",
    fontWeight: "600"
  },

  inputPuntos: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    color: "#111827"
  }
});