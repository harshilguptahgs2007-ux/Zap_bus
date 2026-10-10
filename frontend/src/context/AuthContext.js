import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    username: "priya_sharma",
    email: "priya.sharma@ecoride.com",
    age: 27,
    contact: "+91 98765 43210",
    latitude: 28.6139,
    longitude: 77.209,
    eco_points_total: 420,
  });
  const [token, setToken] = useState("demo-token");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("ecoride_token");
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (e) {
      console.log("No valid session found, starting fresh:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const accessToken = data.access_token;
    setToken(accessToken);
    setAuthToken(accessToken);
    await AsyncStorage.setItem("ecoride_token", accessToken);

    const userData = await api.getMe();
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    await api.register(userData);
    return await login(userData.user, userData.pass_);
  };

  const refreshUser = async () => {
    try {
      const updated = await api.getMe();
      setUser(updated);
      return updated;
    } catch (e) {
      console.error("Refresh user failed:", e);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await AsyncStorage.removeItem("ecoride_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        refreshUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
