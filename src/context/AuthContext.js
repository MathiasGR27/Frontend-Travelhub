import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error cargando la sesión:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (token, userData) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  // --- FUNCIÓN ACTUALIZADA ---
  const actualizarDatosUsuario = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log("Contexto actualizado con nuevos datos:", newUserData);
    } catch (error) {
      console.error("Error al actualizar datos localmente:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, actualizarDatosUsuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
};