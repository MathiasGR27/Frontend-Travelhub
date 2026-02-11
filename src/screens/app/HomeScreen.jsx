import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../styles/constants/colors";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  console.log("Datos del usuario en Home:", user);
  console.log("¿Qué hay en user.telefono?:", user?.telefono);

  return (
    <View style={styles.container}>
      {/* HEADER PERSONALIZADO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TravelHub</Text>
          <Text style={styles.roleBadge}>{user?.rol === 'ADMIN' ? 'Panel de Control' : 'Explorador'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
       <Text style={styles.welcome}>
          Bienvenid@,{"\n"}
          <Text style={styles.userName}>
            {/* Si es ADMIN, dice "Administrador", si es USER, jala su nombre del backend */}
            {user?.rol === 'ADMIN' ? 'Administrador' : (user?.nombre || 'Usuario')}
          </Text>
        </Text>
        {/* --- SECCIÓN ADMINISTRADOR --- */}
          {user?.rol === "ADMIN" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Panel de Control</Text>
              
              {/* BOTÓN GESTIÓN DE VUELOS (NUEVO) */}
              <TouchableOpacity
                style={[styles.card, styles.adminCard]}
                onPress={() => navigation.navigate("AdminVuelos")}
              >
                <View style={styles.iconCircleAdmin}>
                  <Text style={{fontSize: 24}}>🛫</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Gestionar Vuelos</Text>
                  <Text style={styles.cardText}>Crear, editar o eliminar ofertas</Text>
                </View>
              </TouchableOpacity>

              {/* BOTÓN VALIDAR QR */}
              <TouchableOpacity
                style={[styles.card, styles.adminCard]}
                onPress={() => navigation.navigate("ValidarQR")}
              >
                <View style={styles.iconCircleAdmin}>
                  <Text style={{fontSize: 24}}>📸</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Validar Código QR</Text>
                  <Text style={styles.cardText}>Escanear y confirmar abordaje</Text>
                </View>
              </TouchableOpacity>
              {/* BOTÓN NUEVO: GESTIÓN DE TODAS LAS RESERVAS */}
    <TouchableOpacity
      style={[styles.card, styles.adminCard]}
      onPress={() => navigation.navigate("GestionReservas")}
    >
      <View style={styles.iconCircleAdmin}>
        <Text style={{fontSize: 24}}>📋</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>Ver Todas las Reservas</Text>
        <Text style={styles.cardText}>Listado global de pasajeros y pagos</Text>
      </View>
    </TouchableOpacity>
  </View>
)}

        {/* --- SECCIÓN USUARIO (CLIENTE) --- */}
        {user?.rol === "USER" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tus Viajes</Text>
            
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("BuscarVuelos")}
            >
              <View style={styles.iconCircle}>
                <Text style={{fontSize: 24}}>✈️</Text>
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
                <Text style={{fontSize: 24}}>📅</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Mis reservas</Text>
                <Text style={styles.cardText}>Revisa tus tickets y códigos QR</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* --- SECCIÓN COMÚN --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajustes</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Perfil")}
          >
            <View style={styles.iconCircle}>
              <Text style={{fontSize: 24}}>👤</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mi Perfil</Text>
              <Text style={styles.cardText}>Puntos acumulados y datos personales</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
    letterSpacing: 1,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  welcome: {
    color: COLORS.white,
    fontSize: 22,
    marginBottom: 30,
    lineHeight: 30,
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
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminCard: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconCircleAdmin: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#DBEAFE',
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
    marginTop: 2,
  },
});