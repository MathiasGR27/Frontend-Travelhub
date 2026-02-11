import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, TextInput, ScrollView } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function MetodoPagoScreen({ route, navigation }) {
  const { reserva } = route.params;
  const [metodo, setMetodo] = useState("Tarjeta");
  const [usarPuntos, setUsarPuntos] = useState(false);
  const [puntos, setPuntos] = useState("");
  const [loading, setLoading] = useState(false);

  const ejecutarPago = async () => {
    try {
      setLoading(true);
      const payload = {
        id_reserva: reserva.id_reserva,
        metodo: metodo,
        usar_puntos: usarPuntos,
        puntos_usar: usarPuntos ? parseInt(puntos) : 0
      };

      const { data } = await api.post("/pagos/confirmar", payload);

      Alert.alert("¡Éxito!", data.message, [
        { text: "OK", onPress: () => navigation.replace("MisReservas") }
      ]);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Método de Pago</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Resumen</Text>
        <Text style={styles.routeText}>{reserva.vuelo?.origen} → {reserva.vuelo?.destino}</Text>
        <Text style={styles.priceText}>Monto: ${reserva.total}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Selecciona Método</Text>
        <View style={styles.row}>
          {["Tarjeta", "Efectivo", "Transferencia"].map((m) => (
            <TouchableOpacity 
              key={m}
              style={[styles.chip, metodo === m && styles.chipSelected]} 
              onPress={() => setMetodo(m)}
            >
              <Text style={{ color: metodo === m ? '#fff' : '#000' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Usar mis puntos acumulados</Text>
          <Switch value={usarPuntos} onValueChange={setUsarPuntos} />
        </View>

        {usarPuntos && (
          <TextInput
            style={styles.input}
            placeholder="¿Cuántos puntos usar? (Ej: 900)"
            keyboardType="numeric"
            value={puntos}
            onChangeText={setPuntos}
          />
        )}
      </View>

      <PrimaryButton 
        title={loading ? "Procesando..." : `Confirmar Pago de $${reserva.total}`}
        onPress={ejecutarPago}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.primaryDark, padding: 20, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20 },
  label: { fontSize: 13, color: '#999', fontWeight: 'bold', marginBottom: 10 },
  routeText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primaryDark },
  priceText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0' },
  chipSelected: { backgroundColor: COLORS.primary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginTop: 10, padding: 8 }
});