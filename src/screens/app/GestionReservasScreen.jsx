import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importante instalarlo
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

// Clave para guardar los datos en el dispositivo
const ADMIN_RESERVAS_CACHE = "@admin_reservas_cache";

export default function GestionReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [filtradas, setFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  const cargarTodasLasReservas = async () => {
    try {
      setLoading(true);
      
      // 1. Intentamos traer datos frescos del servidor
      const { data } = await api.get("/reservas");
      
      // 2. Si hay éxito, guardamos en el caché para el futuro
      setReservas(data);
      setFiltradas(data);
      await AsyncStorage.setItem(ADMIN_RESERVAS_CACHE, JSON.stringify(data));
      setIsOffline(false);

    } catch (error) {
      console.error("Error cargando reservas:", error);
      
      // 3. SI FALLA (Por falta de internet), intentamos cargar del caché
      const cachedData = await AsyncStorage.getItem(ADMIN_RESERVAS_CACHE);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setReservas(parsedData);
        setFiltradas(parsedData);
        setIsOffline(true);
        Alert.alert("Aviso", "Sin conexión. Mostrando datos guardados localmente.");
      } else {
        Alert.alert("Error", "No hay conexión ni datos guardados.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarTodasLasReservas();
  }, []);

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
      
      {/* Indicador de modo offline */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Estás en modo offline (Datos antiguos)</Text>
        </View>
      )}

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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargarTodasLasReservas(); }} tintColor="white" />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron reservas.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, padding: 15 },
  mainTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 15 },
  offlineBanner: { backgroundColor: '#EF4444', padding: 5, borderRadius: 5, marginBottom: 10 },
  offlineText: { color: 'white', fontSize: 12, textAlign: 'center', fontWeight: 'bold' },
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