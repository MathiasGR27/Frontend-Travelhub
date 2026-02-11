import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from 'react-native-qrcode-svg'; // Requiere: npx expo install react-native-qrcode-svg react-native-svg
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function MisReservasScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para el Modal del QR
  const [modalVisible, setModalVisible] = useState(false);
  const [qrSeleccionado, setQrSeleccionado] = useState(null);

  const { logout } = useContext(AuthContext);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/reservas/mis-reservas");
      setReservas(data);
    } catch (error) {
      console.log("Error detallado:", error.response?.data);
      Alert.alert("Error", error.response?.data?.details || "No se pudieron cargar las reservas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarReservas();
  };

  const abrirTicket = (reserva) => {
  console.log("Datos de la reserva al abrir modal:", reserva); // 👈 Añade esto
  setQrSeleccionado(reserva);
  setModalVisible(true);
};

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Viajes</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {reservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no tienes vuelos reservados.</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id_reserva.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.route}>
                  {item.vuelo?.origen} ✈️ {item.vuelo?.destino}
                </Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: item.estado === 'PENDIENTE' ? '#FEF3C7' : '#D1FAE5' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: item.estado === 'PENDIENTE' ? '#92400E' : '#065F46' }
                  ]}>
                    {item.estado}
                  </Text>
                </View>
              </View>

              <Text style={styles.date}>📅 {item.vuelo?.fecha} | ⏰ {item.vuelo?.hora}</Text>
              
              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Pasajeros:</Text>
              {item.pasajeros?.map((p, index) => (
                <View key={index} style={styles.pasajeroRow}>
                  <Text style={styles.pasajeroName}>👤 {p.nombre_completo}</Text>
                  <Text style={styles.asientoText}>Asiento: {p.asiento}</Text>
                </View>
              ))}

              <View style={styles.footerCard}>
                <View>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.price}>$ {item.total}</Text>
                </View>

                {/* BOTÓN CONDICIONAL: PAGAR O VER QR */}
                {item.estado === 'PENDIENTE' ? (
                  <TouchableOpacity 
                    style={styles.btnPagar}
                    onPress={() => navigation.navigate("MetodoPago", { reserva: item })}
                  >
                    <Text style={styles.btnText}>Pagar Ahora</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.btnVerQR}
                    onPress={() => abrirTicket(item)}
                  >
                    <Text style={styles.btnText}>Ver Ticket QR</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* --- MODAL DEL TICKET QR --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vuelo Confirmado</Text>
            <Text style={styles.modalRoute}>
              {qrSeleccionado?.vuelo?.origen} ➔ {qrSeleccionado?.vuelo?.destino}
            </Text>
            
            <View style={styles.qrContainer}>
              {qrSeleccionado?.codigo_qr ? (
                <QRCode
                  value={qrSeleccionado.codigo_qr}
                  size={180}
                  color="black"
                  backgroundColor="white"
                />
              ) : (
                <Text>Generando código...</Text>
              )}
            </View>

            <Text style={styles.qrCodeString}>{qrSeleccionado?.codigo_qr}</Text>
            <Text style={styles.helperText}>Muestra este código al personal en el aeropuerto</Text>

            <TouchableOpacity 
              style={styles.btnClose} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnCloseText}>Cerrar Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 40, marginBottom: 20 },
  title: { color: COLORS.white, fontSize: 26, fontWeight: "bold" },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 8 },
  logoutText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.primaryDark },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 18, marginBottom: 16, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  route: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryDark },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 14, color: '#6B7280', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 5, textTransform: 'uppercase' },
  pasajeroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pasajeroName: { fontSize: 14, color: COLORS.primaryDark },
  asientoText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  footerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 12, color: '#9CA3AF' },
  price: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryDark },
  btnPagar: { backgroundColor: '#E11D48', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  btnVerQR: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.white, fontSize: 16, opacity: 0.6 },
  
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark, marginBottom: 5 },
  modalRoute: { fontSize: 16, color: '#4B5563', marginBottom: 20 },
  qrContainer: { padding: 15, backgroundColor: 'white', borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  qrCodeString: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1 },
  helperText: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10, paddingHorizontal: 20 },
  btnClose: { marginTop: 25, backgroundColor: '#F3F4F6', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  btnCloseText: { color: '#4B5563', fontWeight: 'bold' }
});