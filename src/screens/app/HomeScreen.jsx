import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import api from "../../services/api";
import { COLORS } from "../../styles/constants/colors";

export default function HomeScreen() {
  const [puntos, setPuntos] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await api.get("/usuarios/mis-puntos");
      setPuntos(data.puntos);
    };
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.points}>Puntos: {puntos}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "bold",
  },
  points: {
    color: COLORS.lightGray,
    fontSize: 18,
    marginTop: 12,
  },
});