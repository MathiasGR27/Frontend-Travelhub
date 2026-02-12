import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function FormVueloScreen({ route, navigation }) {
  const vueloExistente = route.params?.vuelo;

  const [form, setForm] = useState({
    origen: vueloExistente?.origen || "",
    destino: vueloExistente?.destino || "",
    precio: vueloExistente?.precio?.toString() || "",
    fecha_salida: vueloExistente?.fecha_salida || "",
    hora_salida: vueloExistente?.hora_salida || "12:00:00",
    capacidad: vueloExistente?.capacidad?.toString() || "60",
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.origen || !form.destino || !form.precio || !form.fecha_salida) {
      return Alert.alert("Error", "Completa los campos obligatorios");
    }

    try {
      setLoading(true);
      if (vueloExistente) {
        // CAMBIO AQUÍ: id -> id_vuelo
        await api.put(`/vuelos/${vueloExistente.id_vuelo}`, form);
        Alert.alert("Éxito", "Vuelo actualizado correctamente");
      } else {
        // CREAR (POST)
        await api.post("/vuelos", form);
        Alert.alert("Éxito", "Vuelo creado con éxito");
      }
      navigation.goBack();
    } catch (error) {
      // Agregamos un log para ver qué dice el servidor si falla
      console.log("Error al actualizar:", error.response?.data);
      Alert.alert("Error", error.response?.data?.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{vueloExistente ? "Editar Vuelo" : "Nuevo Vuelo"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Origen *</Text>
        <TextInput style={styles.input} value={form.origen} onChangeText={(t) => setForm({ ...form, origen: t })} placeholder="Ciudad de origen" />

        <Text style={styles.label}>Destino *</Text>
        <TextInput style={styles.input} value={form.destino} onChangeText={(t) => setForm({ ...form, destino: t })} placeholder="Ciudad de destino" />

        <Text style={styles.label}>Precio ($) *</Text>
        <TextInput style={styles.input} value={form.precio} keyboardType="numeric" onChangeText={(t) => setForm({ ...form, precio: t })} placeholder="0.00" />

        <Text style={styles.label}>Fecha (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} value={form.fecha_salida} onChangeText={(t) => setForm({ ...form, fecha_salida: t })} placeholder="2026-02-10" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Hora</Text>
            <TextInput style={styles.input} value={form.hora_salida} onChangeText={(t) => setForm({ ...form, hora_salida: t })} placeholder="12:00:00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Capacidad</Text>
            <TextInput style={styles.input} value={form.capacidad} keyboardType="numeric" onChangeText={(t) => setForm({ ...form, capacidad: t })} placeholder="60" />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <PrimaryButton
            title={vueloExistente ? "Actualizar Vuelo" : "Crear Vuelo"}
            onPress={handleSave}
            loading={loading}
          />
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
  label: { color: COLORS.lightGray, marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row' }
});