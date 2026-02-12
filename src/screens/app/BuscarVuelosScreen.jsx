import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator
} from "react-native";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function BuscarVuelosScreen({ navigation }) {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [minPrecio, setMinPrecio] = useState("");
  const [maxPrecio, setMaxPrecio] = useState("");

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    try {
      setLoading(true);
      const params = {
        origen: origen.trim() || undefined,
        destino: destino.trim() || undefined,
        fecha: fecha.trim() || undefined,
        minPrecio: minPrecio || undefined,
        maxPrecio: maxPrecio || undefined
      };
      const response = await api.get("/vuelos/buscar", { params });
      setVuelos(response.data);
    } catch (error) {
      console.error("Error buscando vuelos:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVuelo = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Pasajero", { vuelo: item })}
    >
      <View style={styles.cardRow}>
        <Text style={styles.ciudades}>{item.origen} ➔ {item.destino}</Text>
        <Text style={styles.precio}>${item.precio}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.detalles}>📅 {item.fecha_salida}  •  ⏰ {item.hora_salida}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar Vuelos</Text>

      <View style={styles.filterSection}>
        <TextInput
          style={styles.inputFull}
          placeholder="Ciudad de Origen"
          placeholderTextColor="#888" 
          value={origen}
          onChangeText={setOrigen}
        />
        <TextInput
          style={styles.inputFull}
          placeholder="Ciudad de Destino"
          placeholderTextColor="#888" 
          value={destino}
          onChangeText={setDestino}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.inputHalf, { flex: 2 }]}
            placeholder="Fecha"
            placeholderTextColor="#888" 
            value={fecha}
            onChangeText={setFecha}
          />
          <TextInput
            style={styles.inputHalf}
            placeholder="Min $"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={minPrecio}
            onChangeText={setMinPrecio}
          />
          <TextInput
            style={styles.inputHalf}
            placeholder="Max $"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={maxPrecio}
            onChangeText={setMaxPrecio}
          />
        </View>

        <TouchableOpacity style={styles.btnBuscar} onPress={handleBuscar}>
          <Text style={styles.btnText}>🔍 Aplicar Filtros</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={vuelos}
          keyExtractor={(item) => item.id_vuelo.toString()}
          renderItem={renderVuelo}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay vuelos que coincidan con tu búsqueda.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark, padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 15 },
  filterSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  inputFull: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#000' // <-- CORREGIDO
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  inputHalf: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 2,
    fontSize: 13,
    color: '#000' // <-- CORREGIDO
  },
  btnBuscar: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: 'white', padding: 18, borderRadius: 15, marginBottom: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ciudades: { fontSize: 17, fontWeight: 'bold', color: COLORS.primaryDark },
  precio: { fontSize: 19, fontWeight: 'bold', color: '#10B981' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  detalles: { color: '#6B7280', fontSize: 13 },
  empty: { color: 'white', textAlign: 'center', marginTop: 30, opacity: 0.5 }
});