import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function PagoScreen({ route, navigation }) {
  const { vuelo, listaPasajeros } = route.params;
  const [loading, setLoading] = useState(false);

  const precioTotal = vuelo.precio * listaPasajeros.length;

  const confirmarReserva = async () => {
    try {
      setLoading(true);

      // --- ESTRUCTURA COMPATIBLE CON TU BACKEND ---
      // El backend espera:
      // 1. asiento (del primer pasajero)
      // 2. pasajeros_adicionales (el resto de la lista)
      
      const primerPasajero = listaPasajeros[0];
      
      // Mapeamos los adicionales al formato: nombre_completo y documento
      const adicionales = listaPasajeros.slice(1).map(p => ({
        nombre_completo: `${p.nombre} ${p.apellido || ""}`.trim(),
        documento: p.cedula,
        asiento: p.asiento
      }));

      const body = {
        id_vuelo: vuelo.id_vuelo,
        asiento: primerPasajero.asiento, // 👈 Tu backend lo pide así
        pasajeros_adicionales: adicionales, // 👈 Tu backend lo pide así
        total: precioTotal // Aunque el backend lo recalcula, lo enviamos
      };

      console.log("Enviando al servidor:", body);

      const { data } = await api.post("/reservas", body);

      Alert.alert("¡Éxito!", "Reserva confirmada correctamente", [
        { text: "OK", onPress: () => navigation.replace("MisReservas") }
      ]);

    } catch (error) {
      console.log("DETALLE DEL ERROR:", error.response?.data);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Error al procesar reserva"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Finalizar Compra</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.card}>
          <Text style={styles.label}>VUELO SELECCIONADO</Text>
          <Text style={styles.routeText}>{vuelo.origen} → {vuelo.destino}</Text>
          <Text style={styles.infoText}>📅 {vuelo.fecha_salida} | ⏰ {vuelo.hora_salida}</Text>
          
          <View style={styles.divider} />

          <Text style={styles.label}>PASAJEROS ({listaPasajeros.length})</Text>
          {listaPasajeros.map((p, index) => (
            <View key={index} style={styles.pasajeroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pasajeroNombre}>{p.nombre} {p.apellido}</Text>
                <Text style={styles.pasajeroCedula}>ID: {p.cedula}</Text>
              </View>
              <View style={styles.asientoTag}>
                <Text style={styles.asientoText}>{p.asiento}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio por persona:</Text>
            <Text style={styles.priceValue}>$ {vuelo.precio}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cantidad:</Text>
            <Text style={styles.priceValue}>x{listaPasajeros.length}</Text>
          </View>

          <View style={[styles.priceRow, { marginTop: 15 }]}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
            <Text style={styles.totalValue}>$ {precioTotal.toFixed(2)}</Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <PrimaryButton
              title={`Pagar $${precioTotal.toFixed(2)}`}
              onPress={confirmarReserva}
              loading={loading}
            />
          </View>
        </View>

        <Text style={styles.footerNote}>
          Al confirmar, aceptas los términos y condiciones de transporte de TravelHub.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, marginBottom: 20 },
  backBtn: { color: COLORS.white, fontSize: 30, marginRight: 15 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 25, elevation: 5 },
  label: { fontSize: 11, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  routeText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primaryDark },
  infoText: { fontSize: 15, color: '#4B5563', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  pasajeroRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 10 
  },
  pasajeroNombre: { fontSize: 15, fontWeight: 'bold', color: COLORS.primaryDark },
  pasajeroCedula: { fontSize: 13, color: '#6B7280' },
  asientoTag: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  asientoText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  priceLabel: { color: '#6B7280', fontSize: 14 },
  priceValue: { fontWeight: '600', color: COLORS.primaryDark },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  footerNote: { color: '#9CA3AF', textAlign: 'center', fontSize: 12, marginTop: 20, lineHeight: 18 }
});