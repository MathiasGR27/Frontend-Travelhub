import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function ValidarQRScreen() {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // NUEVO: Estado para guardar la respuesta del Back
  const [datosReserva, setDatosReserva] = useState(null);

  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setIsCameraActive(false);
    setCodigo(data);
    // Ejecutamos la validación automáticamente al escanear
    validarCodigo(data);
  };

  const validarCodigo = async (codigoAValidar) => {
    const cod = codigoAValidar || codigo.trim();
    if (!cod) return Alert.alert("Error", "Ingresa un código");

    try {
      setLoading(true);
      setDatosReserva(null); // Limpiamos búsqueda anterior
      
      const response = await api.get(`/admin/validar-qr/${cod}`);
      
      // Guardamos todo el JSON que mandaste del back
      setDatosReserva(response.data); 
      
    } catch (error) {
      Alert.alert("❌ Error", error.response?.data?.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>Validar Abordaje</Text>

      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCameraActive(false)}>
            <Text style={styles.cancelButtonText}>Cerrar Cámara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity 
            style={styles.scanToggleBtn} 
            onPress={async () => {
              const { granted } = await requestPermission();
              if (granted) { setScanned(false); setIsCameraActive(true); }
            }}
          >
            <Text style={styles.scanToggleText}>📷 Escanear QR</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Código manual"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
          />

          <PrimaryButton title="Validar Reserva" onPress={() => validarCodigo()} loading={loading} />
        </View>
      )}

      {/* --- RENDERIZADO DE LOS DETALLES DEL BACKEND --- */}
      {datosReserva && (
        <View style={styles.infoCard}>
          <View style={styles.successBadge}>
            <Text style={styles.successText}>✓ CÓDIGO VÁLIDO</Text>
          </View>

          <Text style={styles.infoTitle}>Detalles del Vuelo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Ruta:</Text>
            <Text style={styles.value}>{datosReserva.detalles.itinerario}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha/Hora:</Text>
            <Text style={styles.value}>{datosReserva.detalles.fecha} - {datosReserva.detalles.hora}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.infoTitle}>Pasajeros ({datosReserva.conteo.total_pasajeros})</Text>
          {datosReserva.lista_pasajeros.map((p, index) => (
            <View key={index} style={styles.pasajeroItem}>
              <View>
                <Text style={styles.pNombre}>{p.nombre}</Text>
                <Text style={styles.pDoc}>Doc: {p.documento}</Text>
              </View>
              <View style={styles.asientoBadge}>
                <Text style={styles.asientoText}>{p.asiento}</Text>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.btnClear} 
            onPress={() => { setDatosReserva(null); setCodigo(""); }}
          >
            <Text style={styles.btnClearText}>Limpiar para nueva validación</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 40, marginBottom: 20 },
  cameraContainer: { height: 300, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  scanToggleBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  scanToggleText: { color: 'white', fontWeight: 'bold' },
  cancelButton: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'red', padding: 8, borderRadius: 5 },
  cancelButtonText: { color: 'white', fontSize: 12 },
  
  // Estilos de la Tarjeta de Información
  infoCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginTop: 25 },
  successBadge: { backgroundColor: '#D1FAE5', alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginBottom: 15 },
  successText: { color: '#065F46', fontWeight: 'bold', fontSize: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryDark, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { color: '#666', fontSize: 14 },
  value: { fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  pasajeroItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 10, marginBottom: 8 },
  pNombre: { fontWeight: '600', color: '#111' },
  pDoc: { fontSize: 12, color: '#666' },
  asientoBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  asientoText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  btnClear: { marginTop: 20, alignItems: 'center', padding: 10 },
  btnClearText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 }
});