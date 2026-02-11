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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};