import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function AdminVuelosScreen({ navigation }) {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Recargar datos cada vez que la pantalla gana el foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarVuelos);
    return unsubscribe;
  }, [navigation]);

  const cargarVuelos = async () => {
    try {
      setLoading(true);
      // PRUEBA CAMBIANDO ESTA LÍNEA SEGÚN TU RUTA ( /vuelos o /vuelos/listar )
      const { data } = await api.get("/vuelos");

      console.log("Vuelos recibidos:", data);
      setVuelos(data);
    } catch (error) {
      console.error("DETALLE DEL ERROR:", error.response?.data || error.message);
      Alert.alert("Error", "No se pudieron cargar los vuelos");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = (id) => {
    Alert.alert("Eliminar Vuelo", "¿Estás seguro de eliminar este vuelo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => eliminar(id) }
    ]);
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/vuelos/${id}`);
      cargarVuelos();
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el vuelo");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Vuelos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("FormVuelo")}
        >
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={vuelos}
          // Cambiamos item.id por item.id_vuelo
          keyExtractor={(item) => item.id_vuelo.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                {/* Usamos los campos reales de tu modelo VueloOferta */}
                <Text style={styles.route}>{item.origen} → {item.destino}</Text>
                <Text style={styles.details}>{item.fecha_salida} | {item.hora_salida}</Text>
                <Text style={styles.price}>
                  ${item.precio} - <Text style={{ color: '#666' }}>Cap: {item.capacidad}</Text>
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("FormVuelo", { vuelo: item })}
                  style={styles.btnIcon}
                >
                  <Text style={{ fontSize: 20 }}>📝</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmarEliminar(item.id_vuelo)} // Cambiado aquí también
                  style={styles.btnIcon}
                >
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No hay vuelos creados.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, marginBottom: 20 },
  backBtn: { color: COLORS.white, fontSize: 30, marginRight: 15 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: 'bold', flex: 1 },
  addBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  addBtnText: { color: COLORS.white, fontWeight: 'bold' },
  card: { backgroundColor: COLORS.white, padding: 15, borderRadius: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  route: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryDark },
  details: { color: '#666', fontSize: 13, marginTop: 2 },
  price: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row' },
  btnIcon: { padding: 10, marginLeft: 5 },
  empty: { color: COLORS.lightGray, textAlign: 'center', marginTop: 40 }
});