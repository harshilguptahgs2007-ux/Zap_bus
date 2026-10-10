import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Search,
  Mic,
  SlidersHorizontal,
  Locate,
  Layers,
} from "lucide-react-native";
import { THEME } from "../theme/theme";
import { api } from "../api/client";

export const MapCanvas = ({ onSearchPress, onSelectBus }) => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [evOnly, setEvOnly] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchRedisActiveBuses();
    const interval = setInterval(fetchRedisActiveBuses, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchRedisActiveBuses = async () => {
    try {
      const data = await api.getActiveRides();
      if (data && data.rides) {
        setActiveBuses(data.rides);
      }
    } catch (e) {
      // offline fallback
    }
  };

  const handleRecenter = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: "recenter" }, "*");
    }
  };

  const handleToggleStyle = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: "toggleStyle" }, "*");
    }
  };

  return (
    <View style={styles.container}>
      {/* Real Full Interactive Live Map directly served from /map.html */}
      {Platform.OS === "web" ? (
        <iframe
          ref={iframeRef}
          title="EcoRide Transit Map"
          src="/map.html"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            zIndex: 1,
          }}
        />
      ) : null}

      {/* Floating Transit Search Bar */}
      <View style={styles.searchPill}>
        <Search size={18} color={THEME.colors.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where to? (e.g. Noida Sec 18, CP)"
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => onSearchPress && onSearchPress(searchQuery)}
        />
        <TouchableOpacity style={styles.micButton}>
          <Mic size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, evOnly && styles.filterChipActive]}
          onPress={() => setEvOnly(!evOnly)}
        >
          <SlidersHorizontal size={12} color="#fff" />
          <Text style={styles.filterChipText}>EV only</Text>
        </TouchableOpacity>
      </View>

      {/* Live Map Engine Badge */}
      <View style={styles.engineBadge}>
        <Text style={styles.engineBadgeText}>
          🗺️ Live Interactive Map
        </Text>
      </View>

      {/* Floating Map Controls */}
      <View style={styles.controlsCorner}>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Locate size={18} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={handleToggleStyle}
          activeOpacity={0.8}
        >
          <Layers size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: THEME.roundness.xl,
    overflow: "hidden",
    marginHorizontal: 16,
    position: "relative",
    backgroundColor: "#e2e8f0",
    ...THEME.shadows.card,
  },
  searchPill: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.roundness.full,
    gap: 8,
    ...THEME.shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    paddingVertical: 2,
  },
  micButton: {
    padding: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.roundness.full,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  engineBadge: {
    position: "absolute",
    top: 58,
    right: 14,
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
    ...THEME.shadows.card,
  },
  engineBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  controlsCorner: {
    position: "absolute",
    bottom: 12,
    right: 12,
    zIndex: 20,
    gap: 8,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...THEME.shadows.card,
  },
});
