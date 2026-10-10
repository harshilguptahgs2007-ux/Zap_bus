import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Header } from "../components/Header";
import { SavedPlacesScroller } from "../components/SavedPlacesScroller";
import { MapCanvas } from "../components/MapCanvas";
import { ImpactCard } from "../components/ImpactCard";
import { THEME } from "../theme/theme";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Zap, Navigation, X } from "lucide-react-native";

export const HomeScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [rideHistory, setRideHistory] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("Sec 62, Noida");
  const [dropAddress, setDropAddress] = useState("Cyber City, Gurugram");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const data = await api.getMyRides(10);
      setRideHistory(data);
    } catch (e) {
      console.log("Fetch rides error:", e.message);
    }
  };

  const handleBookRide = async () => {
    if (!pickupAddress || !dropAddress) {
      Alert.alert("Error", "Please enter both pickup and destination");
      return;
    }
    setBookingLoading(true);
    try {
      // Send booking request to backend.py
      const payload = {
        pickup_lat: 28.6289,
        pickup_lng: 77.3649,
        drop_lat: 28.4986,
        drop_lng: 77.0878,
        pickup_address: pickupAddress,
        drop_address: dropAddress,
      };
      const newRide = await api.bookRide(payload);
      Alert.alert(
        "⚡ EV Ride Booked!",
        `Ride #${newRide.id} confirmed.\nDistance: ${newRide.distance_km} km\nCached in Redis for fast live dispatch!`
      );
      setBookingModalVisible(false);
      loadRides();
      refreshUser();
    } catch (e) {
      Alert.alert("Booking Error", e.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => navigation.navigate("Profile")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SavedPlacesScroller
          onSelectPlace={(place) => {
            setDropAddress(place.subtitle);
            setBookingModalVisible(true);
          }}
          onAddPlace={() => setBookingModalVisible(true)}
        />

        <MapCanvas
          onSearchPress={(query) => {
            setDropAddress(query);
            setBookingModalVisible(true);
          }}
          onSelectBus={(bus) => {
            Alert.alert("Transit Telemetry", `${bus.name || "EV Bus"}\nLive telemetry synced via Redis!`);
          }}
        />

        {/* Quick EV Ride Booking Action Banner */}
        <View style={styles.quickBookRow}>
          <TouchableOpacity
            style={styles.bookCtaBtn}
            onPress={() => setBookingModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.ctaIconBadge}>
              <Zap size={18} color="#fff" />
            </View>
            <View style={styles.ctaTextCol}>
              <Text style={styles.ctaTitle}>Book Eco Transit Ride</Text>
              <Text style={styles.ctaSubtitle}>Earn 5 EcoPoints per km + Zero emissions</Text>
            </View>
            <Navigation size={18} color={THEME.colors.primaryLight} />
          </TouchableOpacity>
        </View>

        <ImpactCard
          onRedeemPress={() => navigation.navigate("Marketplace")}
          rideHistory={rideHistory}
        />
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Zero-Emission Ride</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <X size={20} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pickup Point</Text>
              <TextInput
                style={styles.textInput}
                value={pickupAddress}
                onChangeText={setPickupAddress}
                placeholder="Enter pickup location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                style={styles.textInput}
                value={dropAddress}
                onChangeText={setDropAddress}
                placeholder="Enter destination"
              />
            </View>

            <View style={styles.rateInfoBox}>
              <Text style={styles.rateInfoTitle}>🌿 Green Mobility Guarantee</Text>
              <Text style={styles.rateInfoText}>
                5 EcoPoints per km are automatically credited upon trip completion.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleBookRide}
              disabled={bookingLoading}
            >
              <Text style={styles.confirmBtnText}>
                {bookingLoading ? "Confirming Ride..." : "Confirm & Dispatch (Redis Live)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    paddingBottom: 90,
  },
  quickBookRow: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  bookCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    padding: 14,
    borderRadius: THEME.roundness.xl,
    gap: 12,
    ...THEME.shadows.float,
  },
  ctaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTextCol: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  ctaSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  textInput: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.roundness.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  rateInfoBox: {
    backgroundColor: THEME.colors.secondaryContainer,
    padding: 12,
    borderRadius: THEME.roundness.md,
    gap: 4,
  },
  rateInfoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primaryDark,
  },
  rateInfoText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  confirmBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.roundness.lg,
    alignItems: "center",
    marginTop: 6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
