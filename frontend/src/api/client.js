import AsyncStorage from "@react-native-async-storage/async-storage";

import { Platform } from "react-native";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000");

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 204) {
      return null;
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, err.message);
    throw err;
  }
};

export const api = {
  // Authentication
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    return data;
  },

  register: async (userData) => {
    return apiFetch("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // User Profile
  getMe: async () => apiFetch("/me"),
  updateMe: async (data) => apiFetch("/me", { method: "PUT", body: JSON.stringify(data) }),
  updateLocation: async (lat, lng) =>
    apiFetch("/me/location", {
      method: "PUT",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    }),

  // Rides & Telemetry
  getMyRides: async (limit = 20) => apiFetch(`/me/rides?limit=${limit}`),
  bookRide: async (rideData) =>
    apiFetch("/rides", {
      method: "POST",
      body: JSON.stringify(rideData),
    }),
  getRide: async (rideId) => apiFetch(`/rides/${rideId}`),
  completeRide: async (rideId) =>
    apiFetch(`/rides/${rideId}/complete`, { method: "POST" }),
  cancelRide: async (rideId) =>
    apiFetch(`/rides/${rideId}/cancel`, { method: "POST" }),

  // Redis Fast Visibility Endpoints
  getActiveRides: async () => apiFetch("/rides/active/live"),
  getNearbyRides: async (lat, lng, radiusKm = 5) =>
    apiFetch(`/rides/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  getNearbyUsers: async (lat, lng, radiusKm = 5) =>
    apiFetch(`/users/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
};
