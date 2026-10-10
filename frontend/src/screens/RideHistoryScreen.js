import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { THEME } from "../theme/theme";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  SlidersHorizontal,
  Calendar,
  Leaf,
  Zap,
  ChevronRight,
  Ruler,
  CheckCircle2,
  Clock,
  Fuel,
} from "lucide-react-native";

export const RideHistoryScreen = () => {
  const { refreshUser } = useAuth();
  const [rides, setRides] = useState([]);
  const [totalDistance, setTotalDistance] = useState(63.5);
  const [ecoPointsTotal, setEcoPointsTotal] = useState(168);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("all"); // 'all', 'month', 'week'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setRefreshing(true);
    try {
      const data = await api.getMyRides(50);
      if (data && data.rides && data.rides.length > 0) {
        setRides(data.rides);
        setTotalDistance(data.total_distance_km || 63.5);
        setEcoPointsTotal(data.eco_points_total || 168);
      } else {
        // Fallback default rides matching Stitch screen e35fa7f967b64fa6a1d5a364c29f3aa8
        setRides([
          {
            id: 1,
            route: "Route 347 (Electric AC)",
            type: "electric",
            dateStr: "Today, 8:45 AM",
            pickup_address: "Sector 62, Noida",
            pickup_sub: "Electronic City Metro Interchange",
            drop_address: "Connaught Place, Central Delhi",
            drop_sub: "Shivaji Stadium Terminal Outer Circle",
            fare: 45,
            fareSub: "Redeemed 10 EcoPoints",
            distance_km: 18.2,
            eco_points_earned: 18,
            status: "completed",
          },
          {
            id: 2,
            route: "Route 729 (CNG Express)",
            type: "cng",
            dateStr: "Yesterday, 6:15 PM",
            pickup_address: "Cyber City Gate 2",
            pickup_sub: "DLF Cyberhub Pickup Bay",
            drop_address: "Sector 62, Noida",
            drop_sub: "Fortis Hospital Crossing",
            fare: 55,
            fareSub: "Standard Fare",
            distance_km: 24.5,
            eco_points_earned: 14,
            status: "completed",
          },
          {
            id: 3,
            route: "Route 102 (Electric Feeder)",
            type: "electric",
            dateStr: "24 Oct, 9:10 AM",
            pickup_address: "Botanical Garden Metro",
            pickup_sub: "Gate No 3 Bus Bay",
            drop_address: "Advant Navis Business Park",
            drop_sub: "Sector 142 Expressway Exit",
            fare: 25,
            fareSub: "Direct Fare",
            distance_km: 9.8,
            eco_points_earned: 10,
            status: "completed",
          },
          {
            id: 4,
            route: "Route 500-E (Zero Emission)",
            type: "electric",
            dateStr: "22 Oct, 7:30 PM",
            pickup_address: "Noida City Centre",
            pickup_sub: "Concourse Platform Link 1",
            drop_address: "Sector 137",
            drop_sub: "Paras Tierea Transit Stand",
            fare: 30,
            fareSub: "Express E-Bus",
            distance_km: 11.0,
            eco_points_earned: 11,
            status: "completed",
          },
        ]);
      }
    } catch (e) {
      console.log("Fetch history error:", e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenReceipt = (ride) => {
    Alert.alert(
      "Receipt & Journey Breakdown",
      `Trip #${ride.id}: ${ride.pickup_address || "Pickup"} → ${ride.drop_address || "Drop"}\nDistance: ${ride.distance_km} km\nEarned: +${ride.eco_points_earned} EcoPoints`
    );
  };

  const renderRideCard = ({ item }) => {
    const isElectric = item.type === "electric" || !item.type;

    return (
      <TouchableOpacity
        style={styles.rideCard}
        onPress={() => handleOpenReceipt(item)}
        activeOpacity={0.88}
      >
        {/* Top Meta Bar */}
        <View style={styles.cardTopMeta}>
          <View
            style={[
              styles.routePill,
              {
                backgroundColor: isElectric
                  ? THEME.colors.primaryLight
                  : THEME.colors.secondaryContainer,
              },
            ]}
          >
            {isElectric ? (
              <Zap size={12} color={THEME.colors.primaryDark} />
            ) : (
              <Fuel size={12} color={THEME.colors.secondary} />
            )}
            <Text
              style={[
                styles.routePillText,
                {
                  color: isElectric
                    ? THEME.colors.primaryDark
                    : THEME.colors.secondary,
                },
              ]}
            >
              {item.route || `Route 347 (EV)`}
            </Text>
          </View>

          <Text style={styles.rideTimeText}>{item.dateStr || "Today, 8:45 AM"}</Text>
        </View>

        {/* Route Visualizer with Vertical Journey Dotted Pin Line */}
        <View style={styles.routeVisualizer}>
          <View style={styles.trackPins}>
            <View style={styles.pinDotStart} />
            <View style={styles.pinTrackLine} />
            <View style={styles.pinDotEnd} />
          </View>

          <View style={styles.locationsContainer}>
            <View style={styles.locationBlock}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {item.pickup_address}
              </Text>
              <Text style={styles.locationSub} numberOfLines={1}>
                {item.pickup_sub || "Pickup Point"}
              </Text>
            </View>

            <View style={styles.locationBlock}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {item.drop_address}
              </Text>
              <Text style={styles.locationSub} numberOfLines={1}>
                {item.drop_sub || "Destination"}
              </Text>
            </View>
          </View>

          <ChevronRight size={18} color={THEME.colors.textMuted} />
        </View>

        {/* Card Footer Bar: Fare, Distance, Eco Badge */}
        <View style={styles.cardFooterBar}>
          <View style={styles.fareCol}>
            <Text style={styles.fareAmount}>₹{item.fare || Math.round(item.distance_km * 3)}</Text>
            <Text style={styles.fareSubText}>
              {item.fareSub || "Redeemed 10 EcoPoints"}
            </Text>
          </View>

          <View style={styles.distanceBadgeRow}>
            <View style={styles.distancePill}>
              <Ruler size={13} color={THEME.colors.textSecondary} />
              <Text style={styles.distanceText}>{item.distance_km} km</Text>
            </View>

            <View style={styles.ecoPointsBadge}>
              <Leaf size={12} color={THEME.colors.primaryDark} />
              <Text style={styles.ecoPointsText}>
                +{item.eco_points_earned || Math.round(item.distance_km)} EcoPoints
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRideCard}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHistory} />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Title and Filter Action */}
            <View style={styles.headerTitleRow}>
              <View>
                <Text style={styles.pageTitle}>Ride History</Text>
                <Text style={styles.pageSubtitle}>
                  Track your green commute milestones
                </Text>
              </View>

              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
                <SlidersHorizontal size={16} color={THEME.colors.secondary} />
                <Text style={styles.filterBtnText}>Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Toggle Pills */}
            <View style={styles.filterPillsRow}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  period === "all" && styles.filterPillActive,
                ]}
                onPress={() => setPeriod("all")}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    period === "all" && styles.filterPillTextActive,
                  ]}
                >
                  All Time
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  period === "month" && styles.filterPillActive,
                ]}
                onPress={() => setPeriod("month")}
              >
                <Calendar
                  size={13}
                  color={period === "month" ? "#ffffff" : THEME.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    period === "month" && styles.filterPillTextActive,
                  ]}
                >
                  This Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterPill,
                  period === "week" && styles.filterPillActive,
                ]}
                onPress={() => setPeriod("week")}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    period === "week" && styles.filterPillTextActive,
                  ]}
                >
                  This Week
                </Text>
              </TouchableOpacity>
            </View>

            {/* Monthly Impact Summary Bento Card */}
            <View style={styles.impactSummaryCard}>
              <View style={styles.leafWatermark}>
                <Leaf size={100} color="#ffffff" opacity={0.12} />
              </View>

              <View style={styles.impactCardHeader}>
                <View style={styles.impactHeaderLeft}>
                  <Leaf size={16} color={THEME.colors.primaryLight} />
                  <Text style={styles.impactHeaderTitle}>OCTOBER ECO-IMPACT</Text>
                </View>
                <View style={styles.commutesCountPill}>
                  <Text style={styles.commutesCountText}>14 Commutes</Text>
                </View>
              </View>

              <View style={styles.impactMetricsGrid}>
                <View style={styles.impactMetricBox}>
                  <Text style={styles.impactMetricLabel}>CO₂ Avoided</Text>
                  <View style={styles.impactMetricValRow}>
                    <Text style={styles.impactBigVal}>32.8</Text>
                    <Text style={styles.impactUnit}>kg</Text>
                  </View>
                </View>

                <View style={styles.impactMetricBox}>
                  <Text style={styles.impactMetricLabel}>EcoPoints Accrued</Text>
                  <View style={styles.impactMetricValRow}>
                    <Text style={styles.impactBigVal}>+168</Text>
                    <Text style={styles.impactUnit}>pts</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.viewBreakdownRow} activeOpacity={0.7}>
                <Text style={styles.viewBreakdownText}>View breakdown</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  headerBlock: {
    gap: 12,
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.roundness.full,
    ...THEME.shadows.card,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.roundness.full,
  },
  filterPillActive: {
    backgroundColor: THEME.colors.secondary,
    ...THEME.shadows.card,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  filterPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  impactSummaryCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.xl,
    padding: 16,
    overflow: "hidden",
    position: "relative",
    gap: 12,
    ...THEME.shadows.float,
  },
  leafWatermark: {
    position: "absolute",
    right: -10,
    bottom: -15,
  },
  impactCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  impactHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  impactHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primaryLight,
    letterSpacing: 0.6,
  },
  commutesCountPill: {
    backgroundColor: THEME.colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
  },
  commutesCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  impactMetricsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  impactMetricBox: {
    flex: 1,
    backgroundColor: "rgba(0, 83, 32, 0.4)",
    borderRadius: THEME.roundness.lg,
    padding: 10,
  },
  impactMetricLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  impactMetricValRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  impactBigVal: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.colors.primaryLight,
  },
  impactUnit: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  viewBreakdownRow: {
    alignSelf: "flex-start",
  },
  viewBreakdownText: {
    fontSize: 11,
    color: "#ffffff",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  rideCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 12,
    overflow: "hidden",
    ...THEME.shadows.card,
  },
  cardTopMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
  },
  routePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  rideTimeText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  routeVisualizer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 2,
  },
  trackPins: {
    alignItems: "center",
    height: 48,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  pinDotStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.secondary,
  },
  pinTrackLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: THEME.colors.surfaceBorder,
  },
  pinDotEnd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
  },
  locationsContainer: {
    flex: 1,
    gap: 8,
  },
  locationBlock: {
    gap: 1,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  locationSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  cardFooterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: THEME.colors.surfaceSecondary,
    marginHorizontal: -14,
    marginBottom: -14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: THEME.roundness.xl,
    borderBottomRightRadius: THEME.roundness.xl,
  },
  fareCol: {
    gap: 1,
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  fareSubText: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontWeight: "600",
  },
  distanceBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "500",
  },
  ecoPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
  },
  ecoPointsText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.primaryDark,
  },
});
