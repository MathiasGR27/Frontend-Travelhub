import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, TextInput, ScrollView } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { AuthContext } from "../../context/AuthContext";

export default function MetodoPagoScreen({ route, navigation }) {
  const { reserva } = route.params;
  const [metodo, setMetodo] = useState("Tarjeta");
  const [usarPuntos, setUsarPuntos] = useState(false);
  const [puntos, setPuntos] = useState("");
  const [loading, setLoading] = useState(false);

  // Extraemos user (para saber los puntos actuales) y actualizarDatosUsuario
  const { user, actualizarDatosUsuario } = useContext(AuthContext);

  const ejecutarPago = async () => {
    try {
      setLoading(true);
      const puntosAUsar = usarPuntos ? parseInt(puntos || 0) : 0;

      // 1. Ejecutar el pago
      // El backend procesa el pago, resta puntos usados y suma los ganados
      const { data } = await api.post("/pagos/confirmar", {
        id_reserva: reserva.id_reserva,
        metodo: metodo,
        usar_puntos: usarPuntos,
        puntos_usar: puntosAUsar
      });

      // 2. ACTUALIZACIÓN DIRECTA
      // Usamos 'puntos_actuales' que es el nombre que devuelve tu backend
      if (data && data.puntos_actuales !== undefined) {
        await actualizarDatosUsuario({ puntos: data.puntos_actuales });
        console.log("✅ Puntos actualizados desde la respuesta del pago:", data.puntos_actuales);
      } else {
        // Fallback local por si el backend cambia la estructura
        const nuevosPuntosLocales = (user.puntos || 0) - puntosAUsar + Math.floor(reserva.total * 0.9); // Ejemplo de cálculo
        await actualizarDatosUsuario({ puntos: nuevosPuntosLocales });
      }

      Alert.alert("¡Pago Exitoso!", "Tu reserva ha sido confirmada y tus puntos actualizados.", [
        {
          text: "OK",
          onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        }
      ]);

    } catch (error) {
      console.log(" Error en el pago:", error.response?.data);
      Alert.alert("Error", error.response?.data?.message || "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Método de Pago</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Resumen del Vuelo</Text>
        <Text style={styles.routeText}>{reserva.vuelo?.origen} ✈️ {reserva.vuelo?.destino}</Text>
        <Text style={styles.priceText}>Total: ${reserva.total}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Selecciona tu Método</Text>
        <View style={styles.row}>
          {["Tarjeta", "Efectivo", "Transferencia"].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, metodo === m && styles.chipSelected]}
              onPress={() => setMetodo(m)}
            >
              <Text style={{ color: metodo === m ? COLORS.white : COLORS.primaryDark, fontWeight: '600' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.labelPuntos}>Usar mis puntos</Text>
            <Text style={styles.puntosDisponibles}>Disponibles: {user?.puntos || 0} pts</Text>
          </View>
          <Switch
            value={usarPuntos}
            onValueChange={setUsarPuntos}
            trackColor={{ false: "#767577", true: COLORS.primary }}
          />
        </View>

        {usarPuntos && (
          <TextInput
            style={styles.input}
            placeholder="¿Cuántos puntos deseas canjear?"
            keyboardType="numeric"
            value={puntos}
            onChangeText={setPuntos}
          />
        )}
      </View>

      <PrimaryButton
        title={loading ? "Procesando..." : `Pagar $${reserva.total}`}
        onPress={ejecutarPago}
        loading={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.primaryDark, padding: 20, justifyContent: 'center' },
  title: { color: COLORS.white, fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 25, marginBottom: 25, elevation: 4 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  labelPuntos: { fontSize: 15, color: COLORS.primaryDark, fontWeight: '600' },
  puntosDisponibles: { fontSize: 12, color: COLORS.primary },
  routeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
  priceText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#F3F4F6' },
  chipSelected: { backgroundColor: COLORS.primary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderBottomWidth: 1, borderColor: COLORS.primary, marginTop: 15, padding: 10, fontSize: 16, color: COLORS.primaryDark }
});