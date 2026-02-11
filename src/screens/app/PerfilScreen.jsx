import { useContext } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", onPress: logout, style: "destructive" },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header con botón volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 50 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar / Inicial */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nombre || "Usuario"}</Text>
          <Text style={styles.userRole}>{user?.rol}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teléfono Móvil</Text>
          {/* Asegúrate de que use user.telefono */}
          <Text style={styles.infoValue}>{user?.telefono || "No disponible"}</Text>
        </View>
        </View>

        {/* Sección de Puntos (Solo para USER) */}
        {user?.rol === "USER" && (
          <View style={styles.pointsCard}>
            <Text style={styles.pointsTitle}>Mis Puntos TravelHub</Text>
            <Text style={styles.pointsValue}>{user?.puntos || 0} ✨</Text>
            <Text style={styles.pointsSub}>Úsalos para obtener descuentos en tus vuelos</Text>
          </View>
        )}

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryDark },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "bold" },
  backArrow: { color: COLORS.white, fontSize: 16 },
  content: { padding: 20, alignItems: "center" },
  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { color: COLORS.white, fontSize: 40, fontWeight: "bold" },
  userName: { color: COLORS.white, fontSize: 22, fontWeight: "bold" },
  userRole: { color: COLORS.primary, fontWeight: "700", marginTop: 4, textTransform: 'uppercase' },
  infoCard: {
    backgroundColor: COLORS.white,
    width: "100%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: { paddingVertical: 10 },
  infoLabel: { color: "#6B7280", fontSize: 14, marginBottom: 4 },
  infoValue: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginVertical: 5 },
  pointsCard: {
    backgroundColor: "#1E293B",
    width: "100%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  pointsTitle: { color: COLORS.white, fontSize: 16 },
  pointsValue: { color: COLORS.primary, fontSize: 32, fontWeight: "bold", marginVertical: 5 },
  pointsSub: { color: COLORS.lightGray, fontSize: 12, opacity: 0.7, textAlign: 'center' },
  logoutButton: {
    width: "100%",
    padding: 18,
    borderRadius: 15,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  logoutButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: 16 },
});