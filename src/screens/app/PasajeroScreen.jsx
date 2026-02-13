import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons"; // Agregamos MaterialIcons
import api from "../../services/api";

export default function PasajeroScreen({ route, navigation }) {
  const { vuelo } = route.params;
  const { user } = useContext(AuthContext);

  const [pasajeros, setPasajeros] = useState([
    { nombre: user?.nombre || "", cedula: user?.cedula || "", asiento: "" }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [indicePasajeroActivo, setIndicePasajeroActivo] = useState(null);
  const [asientosOcupadosDB, setAsientosOcupadosDB] = useState([]);
  const [cargandoAsientos, setCargandoAsientos] = useState(false);

  useEffect(() => {
    fetchAsientosOcupados();
  }, []);

  const fetchAsientosOcupados = async () => {
    try {
      setCargandoAsientos(true);
      // Cambiamos la ruta para que coincida con tu router de Express
      const { data } = await api.get(`/reservas/vuelo/${vuelo.id_vuelo}/asientos`);

      setAsientosOcupadosDB(data);
    } catch (error) {
      console.log("Error al obtener asientos ocupados:", error.response?.data || error.message);
    } finally {
      setCargandoAsientos(false);
    }
  };

  const capacidad = vuelo.capacidad || 40;
  const numColumnas = 4;
  const listaAsientos = Array.from({ length: capacidad }, (_, i) => {
    const fila = Math.floor(i / numColumnas) + 1;
    const letras = ['A', 'B', 'C', 'D'];
    const letra = letras[i % numColumnas];
    return `${fila}${letra}`;
  });

  const agregarPasajero = () => {
    setPasajeros([...pasajeros, { nombre: "", cedula: "", asiento: "" }]);
  };

  const eliminarPasajero = (index) => {
    if (pasajeros.length === 1) return;
    const nuevosPasajeros = pasajeros.filter((_, i) => i !== index);
    setPasajeros(nuevosPasajeros);
  };

  const actualizarPasajero = (text, index, campo) => {
    const nuevosPasajeros = [...pasajeros];
    nuevosPasajeros[index][campo] = text;
    setPasajeros(nuevosPasajeros);
  };

  const abrirMapaAsientos = (index) => {
    setIndicePasajeroActivo(index);
    setModalVisible(true);
    fetchAsientosOcupados();
  };

  const seleccionarAsiento = (asiento) => {
    const yaElegidoGrupo = pasajeros.some((p, idx) => p.asiento === asiento && idx !== indicePasajeroActivo);

    if (yaElegidoGrupo) {
      return Alert.alert("No disponible", "Este asiento ya lo seleccionaste para otro de tus pasajeros.");
    }

    actualizarPasajero(asiento, indicePasajeroActivo, 'asiento');
    setModalVisible(false);
  };

  const handleSiguiente = () => {
    const incompletos = pasajeros.some(p => !p.nombre || !p.cedula || !p.asiento);
    if (incompletos) {
      return Alert.alert("Error", "Debes completar los datos y elegir asiento para todos.");
    }

    navigation.navigate("ReservaAgregada", {
      vuelo: vuelo,
      listaPasajeros: pasajeros,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Datos de Pasajeros</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {pasajeros.map((pasajero, index) => (
          <View key={index} style={styles.formCard}>
            <Text style={styles.pasajeroNumero}>Pasajero #{index + 1}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre Completo"
              placeholderTextColor="#888"
              value={pasajero.nombre}
              onChangeText={(t) => actualizarPasajero(t, index, 'nombre')}
            />

            <TextInput
              style={styles.input}
              placeholder="Cédula / Documento"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={pasajero.cedula}
              onChangeText={(t) => actualizarPasajero(t, index, 'cedula')}
            />

            <TouchableOpacity
              style={[styles.input, styles.asientoSelector, pasajero.asiento ? styles.asientoListo : null]}
              onPress={() => abrirMapaAsientos(index)}
            >
              <Text style={{ color: pasajero.asiento ? COLORS.primary : '#6B7280', fontWeight: 'bold' }}>
                {pasajero.asiento ? `Asiento: ${pasajero.asiento}` : "Toca para elegir asiento"}
              </Text>
              {/* CORRECCIÓN: Usamos MaterialIcons y quitamos el espacio extra en el nombre */}
              <MaterialIcons name="airline-seat-recline-extra" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            {index > 0 && (
              <TouchableOpacity onPress={() => eliminarPasajero(index)} style={styles.deleteBtn}>
                <AntDesign name="delete" size={14} color="#EF4444" />
                <Text style={styles.deleteText}> Quitar</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.btnAdd} onPress={agregarPasajero}>
          <Text style={styles.btnAddText}>+ Añadir otro pasajero</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <PrimaryButton title="Continuar" onPress={handleSiguiente} />
        </View>
      </ScrollView>

      {/* MODAL DEL MAPA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Distribución de Cabina</Text>
              {cargandoAsientos && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={[styles.asientoBox, { width: 12, height: 12 }]} /><Text style={styles.legendText}> Libre</Text></View>
              <View style={styles.legendItem}><View style={[styles.asientoBox, styles.asientoOcupadoDB, { width: 12, height: 12 }]} /><Text style={styles.legendText}> Ocupado</Text></View>
              <View style={styles.legendItem}><View style={[styles.asientoBox, styles.asientoElegidoGrupo, { width: 12, height: 12 }]} /><Text style={styles.legendText}> Tu grupo</Text></View>
            </View>

            <FlatList
              data={listaAsientos}
              numColumns={numColumnas}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const ocupadoDB = asientosOcupadosDB.includes(item);
                const elegidoGrupo = pasajeros.some(p => p.asiento === item);
                const bloqueado = ocupadoDB || elegidoGrupo;

                return (
                  <TouchableOpacity
                    disabled={bloqueado}
                    style={[
                      styles.asientoBox,
                      ocupadoDB && styles.asientoOcupadoDB,
                      elegidoGrupo && styles.asientoElegidoGrupo
                    ]}
                    onPress={() => seleccionarAsiento(item)}
                  >
                    <Text style={[styles.asientoTexto, bloqueado && { color: 'white' }]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCerrarTexto}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, marginBottom: 10 },
  backBtn: { color: COLORS.white, fontSize: 30, marginRight: 15 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  formCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3 },
  pasajeroNumero: { fontWeight: 'bold', color: COLORS.primary, fontSize: 16, marginBottom: 10 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 15, marginBottom: 10, fontSize: 15 },
  asientoSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  asientoListo: { borderColor: COLORS.primary, borderWidth: 1, backgroundColor: '#EFF6FF' },
  btnAdd: { padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.white, borderRadius: 15, marginBottom: 10 },
  btnAddText: { color: COLORS.white, textAlign: 'center', fontWeight: 'bold' },
  deleteBtn: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', marginTop: 5 },
  deleteText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 11, color: '#6B7280' },
  asientoBox: { width: 65, height: 60, margin: 8, backgroundColor: '#E5E7EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  asientoOcupadoDB: { backgroundColor: '#F87171' },
  asientoElegidoGrupo: { backgroundColor: COLORS.primary },
  asientoTexto: { fontWeight: 'bold', fontSize: 13 },
  btnCerrarModal: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 15, marginTop: 15, alignItems: 'center' },
  btnCerrarTexto: { fontWeight: 'bold', color: '#4B5563' }
});