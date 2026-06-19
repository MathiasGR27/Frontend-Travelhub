import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, ScrollView
} from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ReservaAgregadaScreen({ route, navigation }) {

  const { vuelo, listaPasajeros } = route.params;
  const { user, actualizarDatosUsuario } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const precioTotal = vuelo.precio * listaPasajeros.length;

  const confirmarReserva = async () => {
  try {
    setLoading(true);

    const body = {
      id_vuelo: vuelo.id_vuelo,
      listaPasajeros: listaPasajeros.map(p => ({
        nombre: p.nombre,
        cedula: p.cedula,
        asiento: p.asiento
      }))
    };

    const { data } = await api.post("/reservas", body);

    Alert.alert(
      "Éxito",
      "Reserva confirmada correctamente"
    );

  } catch (error) {

    console.log("ERROR COMPLETO:", error);

    const mensaje =
      error.response?.data?.message ||
      error.message ||
      "Microservicio no disponible";

    Alert.alert("Error", mensaje);

  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Finalizar Reserva</Text>
      </View>

      <ScrollView>

        <View style={styles.card}>

          <Text style={styles.label}>VUELO SELECCIONADO</Text>

          <Text style={styles.routeText}>
            {vuelo.origen} → {vuelo.destino}
          </Text>

          {/* ICONOS */}
          <View style={styles.rowIcon}>
            <Ionicons name="calendar-outline" size={18} color="#111827" />
            <Text style={styles.infoText}>
              {vuelo.fecha_salida}
            </Text>
          </View>

          <View style={styles.rowIcon}>
            <Ionicons name="time-outline" size={18} color="#111827" />
            <Text style={styles.infoText}>
              {vuelo.hora_salida}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>
            PASAJEROS ({listaPasajeros.length})
          </Text>

          {listaPasajeros.map((p, index) => (
            <View key={index} style={styles.pasajeroRow}>

              <View>
                <Text style={styles.pNombre}>{p.nombre}</Text>

                <View style={styles.rowIcon}>
                  <Ionicons name="id-card-outline" size={16} color="#111827" />
                  <Text style={styles.pCedula}>
                    {p.cedula}
                  </Text>
                </View>

              </View>

              <View style={styles.asientoTag}>
                <Text style={styles.asientoText}>
                  {p.asiento}
                </Text>
              </View>

            </View>
          ))}

          <View style={styles.divider} />

          {/* PRECIOS */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio:</Text>
            <Text style={styles.priceValue}>$ {vuelo.precio}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cantidad:</Text>
            <Text style={styles.priceValue}>
              x{listaPasajeros.length}
            </Text>
          </View>

          <View style={[styles.priceRow, { marginTop: 10 }]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>
              $ {precioTotal.toFixed(2)}
            </Text>
          </View>

          <PrimaryButton
            title="Confirmar Reserva"
            onPress={confirmarReserva}
            loading={loading}
          />

        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    marginBottom: 20
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20
  },

  label: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "bold",
    marginBottom: 8
  },

  routeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827"
  },

  infoText: {
    color: "#111827",
    marginLeft: 5
  },

  rowIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },

  pasajeroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },

  pNombre: {
    fontWeight: "bold",
    color: "#111827"
  },

  pCedula: {
    marginLeft: 5,
    color: "#111827"
  },

  asientoTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "center"
  },

  asientoText: {
    color: "#fff",
    fontWeight: "bold"
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  priceLabel: {
    color: "#6B7280"
  },

  priceValue: {
    color: "#111827",
    fontWeight: "600"
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827"
  },

  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15
  }
});