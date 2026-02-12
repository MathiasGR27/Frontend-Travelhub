import React, { useContext, useState } from "react";
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Image,
  Dimensions 
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";

const { width } = Dimensions.get('window');

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permisos", "Necesitamos acceso a tu galería para cambiar la foto.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      // Aquí iría tu lógica de subir a la API: api.post('/user/avatar', formData...)
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: logout, style: "destructive" },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER FIJO (No se mueve con el scroll) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.logo}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Gestiona tu información personal</Text>
        </View>
      </View>

      {/* CONTENIDO DESLIZABLE */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        overScrollMode="never"
      >
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              {image || user?.foto ? (
                <Image source={{ uri: image || user?.foto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Text style={{ fontSize: 14 }}>📸</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.nombre || "Usuario"}</Text>
          <Text style={styles.userRoleBadge}>{user?.rol || 'EXPLORADOR'}</Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Datos de contacto</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono Móvil</Text>
            <Text style={styles.infoValue}>{user?.telefono || "No disponible"}</Text>
          </View>
        </View>

        {/* SECCIÓN DE PUNTOS (Solo para USER) */}
        {user?.rol === "USER" && (
          <View style={[styles.card, styles.pointsCard]}>
            <Text style={styles.pointsTitle}>Mis Puntos TravelHub</Text>
            <Text style={styles.pointsValue}>{user?.puntos || 0} ✨</Text>
            <Text style={styles.pointsSubText}>Úsalos para obtener descuentos en tus vuelos</Text>
          </View>
        )}

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* ESPACIADOR EXTRA AL FINAL */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Fundamental para que el ScrollView funcione
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    zIndex: 10,
  },
  backBtnContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  logo: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40, // Espacio suficiente para ver el botón de logout
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: "bold",
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  userName: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
  },
  userRoleBadge: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    width: "100%",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
  },
  cardSectionTitle: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "800",
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1,
  },
  infoRow: {
    paddingVertical: 4,
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  pointsCard: {
    backgroundColor: "#1E293B",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pointsTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  pointsValue: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: "900",
    marginVertical: 8,
  },
  pointsSubText: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  logoutButton: {
    width: "100%",
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.1)", 
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutButtonText: {
    color: "#F87171",
    fontWeight: "800",
    fontSize: 16,
    textTransform: 'uppercase',
  },
});