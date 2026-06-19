import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator
} from "react-native";

import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { Ionicons } from "@expo/vector-icons";

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
      console.log("Error:", error.message);

    } finally {
      setLoading(false);
    }
  };

  const renderVuelo = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Pasajero", { vuelo: item })}
    >

      {/* RUTA */}
      <View style={styles.cardRow}>
        <Text style={styles.ciudades}>
          <Ionicons name="airplane-outline" size={14} /> {" "}
          {item.origen} ➜ {item.destino}
        </Text>

        <Text style={styles.precio}>
          <Ionicons name="cash-outline" size={14} /> ${item.precio}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* FECHA */}
      <Text style={styles.detalles}>
        <Ionicons name="calendar-outline" size={14} /> {" "}
        {item.fecha_salida} • {item.hora_salida}
      </Text>

    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="search-outline" size={24} color="#fff" />
        <Text style={styles.title}>Explorar Vuelos</Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filterSection}>

        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} />
          <TextInput
            style={styles.input}
            placeholder="Ciudad de Origen"
            value={origen}
            onChangeText={setOrigen}
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="navigate-outline" size={18} />
          <TextInput
            style={styles.input}
            placeholder="Ciudad de Destino"
            value={destino}
            onChangeText={setDestino}
          />
        </View>

        <View style={styles.row}>

          <View style={styles.inputSmall}>
            <Ionicons name="calendar-outline" size={16} />
            <TextInput
              style={styles.input}
              placeholder="Fecha"
              value={fecha}
              onChangeText={setFecha}
            />
          </View>

          <View style={styles.inputSmall}>
            <Ionicons name="cash-outline" size={16} />
            <TextInput
              style={styles.input}
              placeholder="Min"
              keyboardType="numeric"
              value={minPrecio}
              onChangeText={setMinPrecio}
            />
          </View>

          <View style={styles.inputSmall}>
            <Ionicons name="cash-outline" size={16} />
            <TextInput
              style={styles.input}
              placeholder="Max"
              keyboardType="numeric"
              value={maxPrecio}
              onChangeText={setMaxPrecio}
            />
          </View>

        </View>

        {/* BOTÓN */}
        <TouchableOpacity style={styles.btnBuscar} onPress={handleBuscar}>
          <Ionicons name="search" size={18} color="white" />
          <Text style={styles.btnText}>Buscar vuelos</Text>
        </TouchableOpacity>

      </View>

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={vuelos}
          keyExtractor={(item) => item.id_vuelo.toString()}
          renderItem={renderVuelo}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    padding: 20
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 40,
    marginBottom: 15
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold"
  },

  filterSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 5
  },

  inputSmall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 2,
    gap: 5
  },

  input: {
    flex: 1,
    marginLeft: 5,
    color: "#111827"
  },

  row: {
    flexDirection: "row"
  },

  btnBuscar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    marginTop: 10
  },

  btnText: {
    color: "white",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  ciudades: {
    fontWeight: "bold",
    color: "#111827"
  },

  precio: {
    fontWeight: "bold",
    color: "#10B981"
  },

  detalles: {
    marginTop: 5,
    color: "#6B7280"
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8
  }
});