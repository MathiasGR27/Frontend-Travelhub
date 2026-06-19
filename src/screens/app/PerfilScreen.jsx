import React, { useContext, useState, useEffect } from "react";
import {
  Alert, ScrollView, StyleSheet, Text, TouchableOpacity,
  View, Image, ActivityIndicator
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";
import api from "../../services/api";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function PerfilScreen({ navigation }) {

  const { user, logout, actualizarDatosUsuario } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const IMAGE_BASE = "http://192.168.5.45:4001";

  useEffect(() => {
    if (user?.foto) setImage(user.foto);
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permisos", "Necesitamos acceso a la galería.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      subirFoto(result.assets[0].uri);
    }
  };

  const subirFoto = async (uri) => {
    const userId = user?.id;

    if (!userId) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("foto", {
        uri,
        name: `avatar_${userId}.jpg`,
        type: "image/jpeg",
      });

      const { data } = await api.post(
        `/usuarios/update-avatar/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.foto) {
        setImage(data.foto);
        await actualizarDatosUsuario({ foto: data.foto });
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const renderAvatar = () => {
    const imagenAMostrar = image || user?.foto;

    if (imagenAMostrar) {
      return (
        <Image
          source={{ uri: imagenAMostrar?.replace("http://192.168.5.45:4000", IMAGE_BASE) }}
          style={styles.avatarImage}
        />
      );
    }

    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>
          {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={styles.logo}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            <View style={styles.avatarWrapper}>
              {renderAvatar()}

              <View style={styles.editBadge}>
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="camera" size={18} color="black" />
                )}
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.nombre}</Text>

          <Text style={styles.userRoleBadge}>
            {user?.rol}
          </Text>
        </View>

        {/* PUNTOS */}
        {user?.rol === "USER" && (
          <View style={styles.pointsCard}>
            <Text style={styles.pointsTitle}>Mis Puntos</Text>
            <Text style={styles.pointsValue}>
              {user?.puntos || 0} ✨
            </Text>
          </View>
        )}

        {/* INFO */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            Información de la cuenta
          </Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={18} color="#666" />
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={18} color="#666" />
            <Text style={styles.infoValue}>
              {user?.telefono || "No disponible"}
            </Text>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#F87171" />
          <Text style={styles.logoutButtonText}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ... (Los estilos se mantienen iguales)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, marginRight: 15 },
  logo: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  avatarSection: { marginVertical: 20, alignItems: 'center' },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, borderColor: COLORS.primary },
  avatarPlaceholder: { width: 130, height: 130, borderRadius: 65, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: 'white', fontSize: 55, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  userName: { color: 'white', fontSize: 26, fontWeight: 'bold', marginTop: 15 },
  userRoleBadge: { color: COLORS.primary, fontWeight: 'bold', marginTop: 5, letterSpacing: 2, textTransform: 'uppercase' },
  pointsCard: { backgroundColor: '#1e293b', width: '90%', borderRadius: 24, padding: 25, marginVertical: 15, alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  pointsTitle: { color: 'white', fontSize: 14, opacity: 0.8 },
  pointsValue: { color: COLORS.primary, fontSize: 44, fontWeight: '900', marginTop: 5 },
  card: { backgroundColor: 'white', width: '90%', borderRadius: 28, padding: 25, marginTop: 10 },
  cardSectionTitle: { fontSize: 11, color: "#9CA3AF", fontWeight: "800", textTransform: 'uppercase', marginBottom: 15 },
  infoRow: { paddingVertical: 5 },
  infoLabel: { color: "#6B7280", fontSize: 12, marginBottom: 4 },
  infoValue: { color: "#111827", fontSize: 16, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 15 },
  logoutButton: { marginTop: 30, width: '90%', padding: 20, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  logoutButtonText: { color: "#F87171", fontWeight: "800", fontSize: 16 }
});