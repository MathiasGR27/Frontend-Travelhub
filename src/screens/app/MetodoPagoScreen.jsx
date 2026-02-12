import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, TextInput, ScrollView } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { AuthContext } from "../../context/AuthContext";

export default function MetodoPagoScreen({ route, navigation }) {
  const { reserva } = route.params;
  const [metodo, setMetodo] = useState("Tarjeta"); // Por defecto Tarjeta
  const [usarPuntos, setUsarPuntos] = useState(false);
  const [puntos, setPuntos] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para los datos de la tarjeta
  const [tarjetaNum, setTarjetaNum] = useState("");
  const [fechaVence, setFechaVence] = useState("");
  const [cvv, setCvv] = useState("");

  const { user, actualizarDatosUsuario } = useContext(AuthContext);

  // Lógica de descuento para mostrar el precio real en el botón
  const calcularDescuentoFront = (pts) => {
    if (pts >= 3000) return 0.30;
    if (pts >= 2500) return 0.25;
    if (pts >= 2000) return 0.20;
    if (pts >= 1500) return 0.15;
    if (pts >= 900)  return 0.10;
    if (pts >= 450)  return 0.05;
    return 0;
  };

  const ptsInput = parseInt(puntos || 0);
  const porcentajeDesc = usarPuntos ? calcularDescuentoFront(ptsInput) : 0;
  const totalConDescuento = reserva.total - (reserva.total * porcentajeDesc);

  const ejecutarPago = async () => {
    // Si elige tarjeta, validamos que los campos no estén vacíos
    if (metodo === "Tarjeta") {
      if (tarjetaNum.length < 16 || !fechaVence || cvv.length < 3) {
        return Alert.alert("Atención", "Por favor completa los datos de tu tarjeta");
      }
    }

    try {
      setLoading(true);
      const { data } = await api.post("/pagos/confirmar", {
        id_reserva: reserva.id_reserva,
        metodo,
        usar_puntos: usarPuntos,
        puntos_usar: ptsInput,
        // Mandamos un detalle ficticio de la tarjeta para el registro
        detalles_pago: metodo === "Tarjeta" ? { last4: tarjetaNum.slice(-4) } : null 
      });

      if (data.puntos_actuales !== undefined) {
        await actualizarDatosUsuario({ puntos: data.puntos_actuales });
      }

      Alert.alert("¡Pago Exitoso!", "Tu reserva ha sido confirmada y el total actualizado.", [
        { 
          text: "OK", 
          onPress: () => navigation.reset({ index: 0, routes: [{ name: "Home" }] }) 
        }
      ]);
    } catch (error) {
      console.log("Error en el pago:", error.response?.data);
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
        
        {/* Precio dinámico: Tacha el original si hay descuento */}
        <Text style={[styles.priceText, usarPuntos && porcentajeDesc > 0 && styles.priceOriginalTachado]}>
          Total: ${reserva.total}
        </Text>
        {usarPuntos && porcentajeDesc > 0 && (
          <Text style={styles.priceNew}>Nuevo Total: ${totalConDescuento.toFixed(2)}</Text>
        )}

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

        {/* --- FORMULARIO SOLO SI ES TARJETA --- */}
        {metodo === "Tarjeta" && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Datos de tu Tarjeta</Text>
            <TextInput 
              style={styles.inputCard} 
              placeholder="Número de Tarjeta (16 dígitos)" 
              placeholderTextColor="#999"
              keyboardType="numeric" 
              maxLength={16} 
              value={tarjetaNum} 
              onChangeText={setTarjetaNum} 
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput 
                style={[styles.inputCard, { flex: 1 }]} 
                placeholder="MM/AA" 
                placeholderTextColor="#999"
                value={fechaVence} 
                onChangeText={setFechaVence} 
              />
              <TextInput 
                style={[styles.inputCard, { flex: 1 }]} 
                placeholder="CVV" 
                placeholderTextColor="#999"
                keyboardType="numeric" 
                maxLength={3} 
                secureTextEntry 
                value={cvv} 
                onChangeText={setCvv} 
              />
            </View>
          </View>
        )}

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
            style={styles.inputPuntos}
            placeholder="¿Cuántos puntos deseas canjear?"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={puntos}
            onChangeText={setPuntos}
          />
        )}
      </View>

      <PrimaryButton
        title={loading ? "Procesando..." : `Pagar $${totalConDescuento.toFixed(2)}`}
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
  label: { fontSize: 11, color: '#6B7280', fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  routeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
  priceText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
  priceOriginalTachado: { fontSize: 16, textDecorationLine: 'line-through', color: '#9CA3AF' },
  priceNew: { fontSize: 24, fontWeight: 'bold', color: "#10B981", marginTop: 2 }, // Color verde para el descuento
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#F3F4F6' },
  chipSelected: { backgroundColor: COLORS.primary },
  inputCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10, color: '#000', borderWidth: 1, borderColor: '#E5E7EB' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelPuntos: { fontSize: 15, color: COLORS.primaryDark, fontWeight: '600' },
  puntosDisponibles: { fontSize: 12, color: COLORS.primary },
  inputPuntos: { borderBottomWidth: 1, borderColor: COLORS.primary, marginTop: 15, padding: 10, color: '#000', fontSize: 16 }
});