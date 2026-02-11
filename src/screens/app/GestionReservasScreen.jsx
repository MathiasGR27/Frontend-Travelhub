import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  TextInput 
} from "react-native";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function GestionReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [filtradas, setFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarTodasLasReservas = async () => {
  try {
    setLoading(true);
    
    // CAMBIO AQUÍ: Usamos /reservas porque ahí definiste el router.get("/")
    const { data } = await api.get("/reservas"); 
    
    setReservas(data);
    setFiltradas(data);
  } catch (error) {
    console.error("Error cargando reservas:", error);
    // Si falla, revisa los logs del backend para ver si es un error de permisos (403)
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    cargarTodasLasReservas();
  }, []);

  // Buscador por nombre de usuario o destino
  const handleSearch = (text) => {
    setBusqueda(text);
    const lowerText = text.toLowerCase();
    const resultado = reservas.filter(r => 
      r.usuario?.nombre_completo.toLowerCase().includes(lowerText) ||
      r.vuelo?.destino.toLowerCase().includes(lowerText) ||
      r.id_reserva.toString().includes(lowerText)
    );
    setFiltradas(resultado);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.reservaId}>Reserva #{item.id_reserva}</Text>
          <Text style={styles.clienteName}>👤 {item.usuario?.nombre_completo}</Text>
          <Text style={styles.clienteEmail}>{item.usuario?.email}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.estado === 'PAGADA' ? '#D1FAE5' : '#FEF3C7' }]}>
          <Text style={[styles.badgeText, { color: item.estado === 'PAGADA' ? '#065F46' : '#92400E' }]}>
            {item.estado}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.vueloInfo}>
        <Text style={styles.vueloText}>
          ✈️ {item.vuelo?.origen} ➔ {item.vuelo?.destino}
        </Text>
        <Text style={styles.vueloDetalle}>
          Fecha: {item.vuelo?.fecha_salida} | {item.vuelo?.hora_salida}
        </Text>
      </View>

      <View style={styles.pasajerosContainer}>
        <Text style={styles.pasajerosTitle}>Pasajeros registrados:</Text>
        {item.pasajeros?.map((p, idx) => (
          <Text key={idx} style={styles.pasajeroTag}>
            • {p.nombre_completo} (Asiento: {p.asiento})
          </Text>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.fechaReserva}>Realizada el: {new Date(item.fecha_reserva).toLocaleDateString()}</Text>
        <Text style={styles.totalText}>Total: ${item.total}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Panel de Reservas</Text>
      
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por cliente, destino o ID..."
        value={busqueda}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id_reserva.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); cargarTodasLasReservas();}} tintColor="white" />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron reservas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, padding: 15 },
  mainTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 15 },
  searchBar: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryDark },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reservaId: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },
  clienteName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  clienteEmail: { fontSize: 12, color: '#666' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  vueloInfo: { marginBottom: 10 },
  vueloText: { fontSize: 15, fontWeight: '600', color: COLORS.primaryDark },
  vueloDetalle: { fontSize: 13, color: '#666' },
  pasajerosContainer: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8 },
  pasajerosTitle: { fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 5 },
  pasajeroTag: { fontSize: 13, color: '#4B5563' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
  fechaReserva: { fontSize: 11, color: '#9CA3AF' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryDark },
  emptyText: { color: 'white', textAlign: 'center', marginTop: 50, opacity: 0.5 }
});