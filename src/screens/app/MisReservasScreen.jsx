import React, { useContext, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import QRCode from 'react-native-qrcode-svg';
import { useQuery } from '@tanstack/react-query'; // Hook de React Query
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function MisReservasScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [qrSeleccionado, setQrSeleccionado] = useState(null);
  const { logout } = useContext(AuthContext);

  // 1. CONFIGURACIÓN DE REACT QUERY (Persistencia Offline Automática)
  const { 
    data: reservas = [], 
    isLoading, 
    isRefetching, 
    refetch 
  } = useQuery({
    queryKey: ['mis-reservas'], // Identificador único en el "baúl"
    queryFn: async () => {
      const { data } = await api.get("/reservas/mis-reservas");
      return data;
    },
  });

  // Manejo del botón físico de atrás
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const abrirTicket = (reserva) => {
    setQrSeleccionado(reserva);
    setModalVisible(true);
  };

  const irAHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  // Pantalla de carga (Solo la primera vez que se instala la app)
  if (isLoading && !isRefetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeBtn} onPress={irAHome}>
          <Text style={styles.homeBtnText}>🏠 Inicio</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
           <Text style={styles.logo}>Mis Viajes</Text>
           <Text style={styles.subtitle}>Tu historial de abordaje</Text>
        </View>
      </View>

      {reservas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no tienes vuelos reservados.</Text>
          <TouchableOpacity style={styles.btnExplorar} onPress={irAHome}>
            <Text style={styles.btnText}>Explorar Vuelos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.id_reserva.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
                refreshing={isRefetching} 
                onRefresh={refetch} 
                tintColor={COLORS.white} 
            />
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

              <Text style={styles.date}>
                📅 {item.vuelo?.fecha_salida || item.vuelo?.fecha} | ⏰ {item.vuelo?.hora_salida || item.vuelo?.hora}
              </Text>

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
                  <Text style={styles.totalLabel}>Total Pagado:</Text>
                  <Text style={styles.price}>$ {item.total}</Text>
                </View>

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
                    <Text style={styles.btnText}>Ver Ticket</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* MODAL QR (Funciona Offline porque el código ya está en la data) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Boarding Pass</Text>
            <Text style={styles.modalRoute}>
              {qrSeleccionado?.vuelo?.origen} ➔ {qrSeleccionado?.vuelo?.destino}
            </Text>

            <View style={styles.qrContainer}>
              {qrSeleccionado?.codigo_qr && (
                <QRCode
                  value={qrSeleccionado.codigo_qr}
                  size={200}
                />
              )}
            </View>

            <Text style={styles.qrCodeString}>{qrSeleccionado?.codigo_qr}</Text>
            <Text style={styles.helperText}>Presenta este QR en la puerta de embarque</Text>

            <TouchableOpacity style={styles.btnClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 50, marginBottom: 20 },
  homeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14, marginRight: 15 },
  homeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  titleContainer: { flex: 1 },
  logo: { color: COLORS.white, fontSize: 26, fontWeight: "bold" },
  subtitle: { color: COLORS.white, fontSize: 13, opacity: 0.6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.primaryDark },
  listContent: { paddingBottom: 30 },
  card: { 
    backgroundColor: COLORS.white, 
    padding: 24, 
    borderRadius: 28, 
    marginBottom: 20, 
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  route: { fontSize: 18, fontWeight: "800", color: COLORS.primaryDark },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  date: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  pasajeroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pasajeroName: { fontSize: 15, color: '#374151', fontWeight: '500' },
  asientoText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  footerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  price: { fontSize: 22, fontWeight: "900", color: COLORS.primaryDark },
  btnPagar: { backgroundColor: '#E11D48', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 15 },
  btnVerQR: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 15 },
  btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.white, fontSize: 16, marginBottom: 20, opacity: 0.7 },
  btnExplorar: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 32, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.primaryDark, marginBottom: 5 },
  modalRoute: { fontSize: 16, color: '#6B7280', marginBottom: 25 },
  qrContainer: { padding: 20, backgroundColor: 'white', borderRadius: 24, elevation: 20 },
  qrCodeString: { marginTop: 20, fontSize: 13, fontWeight: '800', color: '#9CA3AF', letterSpacing: 2 },
  helperText: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 10 },
  btnClose: { marginTop: 30, backgroundColor: '#F3F4F6', paddingVertical: 16, width: '100%', borderRadius: 18, alignItems: 'center' },
  btnCloseText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 }
});