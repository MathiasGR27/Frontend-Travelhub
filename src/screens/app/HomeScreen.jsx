import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TravelHub</Text>
          <Text style={styles.roleBadge}>
            {user?.rol === "ADMIN" ? "Panel de Control" : "Explorador"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>
          Bienvenid@,{"\n"}
          <Text style={styles.userName}>
            {user?.rol === "ADMIN" ? "Administrador" : user?.nombre || "Usuario"}
          </Text>
        </Text>

        {/* ================= ADMIN ================= */}
        {user?.rol === "ADMIN" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Panel de Control</Text>

            {/* VUELOS */}
            <TouchableOpacity
              style={[styles.card, styles.adminCard]}
              onPress={() => navigation.navigate("AdminVuelos")}
            >
              <View style={styles.iconCircleAdmin}>
                <Ionicons name="airplane-outline" size={24} color="#2563eb" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Gestionar Vuelos</Text>
                <Text style={styles.cardText}>Crear, editar o eliminar ofertas</Text>
              </View>
            </TouchableOpacity>

            {/* QR */}
            <TouchableOpacity
              style={[styles.card, styles.adminCard]}
              onPress={() => navigation.navigate("ValidarQR")}
            >
              <View style={styles.iconCircleAdmin}>
                <Ionicons name="qr-code-outline" size={24} color="#16a34a" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Validar Código QR</Text>
                <Text style={styles.cardText}>Escanear y confirmar abordaje</Text>
              </View>
            </TouchableOpacity>

            {/* RESERVAS */}
            <TouchableOpacity
              style={[styles.card, styles.adminCard]}
              onPress={() => navigation.navigate("GestionReservas")}
            >
              <View style={styles.iconCircleAdmin}>
                <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Ver Reservas</Text>
                <Text style={styles.cardText}>Listado global de pasajeros</Text>
              </View>
            </TouchableOpacity>

            {/* ADMIN */}
            <TouchableOpacity
              style={[styles.card, styles.adminCard]}
              onPress={() => navigation.navigate("Register", { isAdminCreator: true })}
            >
              <View style={styles.iconCircleAdmin}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#7c3aed" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Registrar Administrador</Text>
                <Text style={styles.cardText}>Acceso al panel</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= USER ================= */}
        {user?.rol === "USER" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus Viajes</Text>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("BuscarVuelos")}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="airplane-outline" size={24} color="#2563eb" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Buscar vuelos</Text>
                <Text style={styles.cardText}>Encuentra tu próximo destino</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("MisReservas")}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={24} color="#f97316" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Mis reservas</Text>
                <Text style={styles.cardText}>Revisa tus tickets</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= PERFIL ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Perfil")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={24} color="#0ea5e9" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mi Perfil</Text>
              <Text style={styles.cardText}>Datos personales y puntos</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  brand: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
  },
  roleBadge: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  welcome: {
    color: COLORS.white,
    fontSize: 22,
    marginBottom: 30,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 28,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.6,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
  },
  adminCard: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconCircleAdmin: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  cardText: {
    color: "#6B7280",
    fontSize: 13,
  },
});