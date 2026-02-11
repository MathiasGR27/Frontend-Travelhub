import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";

export default function PasajeroScreen({ route, navigation }) {
  const { vuelo } = route.params;
  const { user } = useContext(AuthContext);

  // Ahora usamos un Array de objetos
  const [pasajeros, setPasajeros] = useState([
    { nombre: user?.nombre || "", cedula: user?.cedula || "", asiento: "" }
  ]);

  const agregarPasajero = () => {
    setPasajeros([...pasajeros, { nombre: "", cedula: "", asiento: "" }]);
  };

  const eliminarPasajero = (index) => {
    if (pasajeros.length === 1) return; // No dejar la lista vacía
    const nuevosPasajeros = pasajeros.filter((_, i) => i !== index);
    setPasajeros(nuevosPasajeros);
  };

  const actualizarPasajero = (text, index, campo) => {
    const nuevosPasajeros = [...pasajeros];
    nuevosPasajeros[index][campo] = text;
    setPasajeros(nuevosPasajeros);
  };

  const handleSiguiente = () => {
    // Validar que todos los pasajeros tengan datos
    const incompletos = pasajeros.some(p => !p.nombre || !p.cedula || !p.asiento);
    
    if (incompletos) {
      return Alert.alert("Error", "Completa todos los datos de todos los pasajeros.");
    }

    navigation.navigate("Pago", {
      vuelo: vuelo,
      listaPasajeros: pasajeros, // Enviamos el array completo
      cantidad: pasajeros.length
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pasajeros</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {pasajeros.map((pasajero, index) => (
          <View key={index} style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.pasajeroNumero}>Pasajero #{index + 1}</Text>
              {index > 0 && (
                <TouchableOpacity onPress={() => eliminarPasajero(index)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              )}
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Nombre Completo"
              value={pasajero.nombre}
              onChangeText={(t) => actualizarPasajero(t, index, 'nombre')}
            />

            <TextInput 
              style={styles.input} 
              placeholder="Cédula / Pasaporte"
              keyboardType="numeric"
              value={pasajero.cedula}
              onChangeText={(t) => actualizarPasajero(t, index, 'cedula')}
            />

            <TextInput 
              style={[styles.input, styles.asientoInput]} 
              placeholder="Asiento (Ej: 12A)"
              autoCapitalize="characters"
              value={pasajero.asiento}
              onChangeText={(t) => actualizarPasajero(t, index, 'asiento')}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btnAdd} onPress={agregarPasajero}>
          <Text style={styles.btnAddText}>+ Agregar otro pasajero</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <PrimaryButton title="Continuar al Pago" onPress={handleSiguiente} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, marginBottom: 10 },
  backBtn: { color: COLORS.white, fontSize: 30, marginRight: 15 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  formCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  pasajeroNumero: { fontWeight: 'bold', color: COLORS.primary, fontSize: 16 },
  deleteText: { color: 'red', fontWeight: '600' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 15, marginBottom: 10, fontSize: 15 },
  asientoInput: { borderColor: COLORS.primary, borderWidth: 1, fontWeight: 'bold' },
  btnAdd: { padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.white, borderRadius: 15, marginBottom: 10 },
  btnAddText: { color: COLORS.white, textAlign: 'center', fontWeight: 'bold' }
});