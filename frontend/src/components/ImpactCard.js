import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Leaf, Award, Coins, CloudLightning, QrCode } from "lucide-react-native";
import { THEME } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export const ImpactCard = ({ onRedeemPress, rideHistory }) => {
  const { user } = useAuth();

  const ecoPoints = user ? user.eco_points_total : 420;
  const totalRides = rideHistory?.rides ? rideHistory.rides.length : 8;
  const totalDist = rideHistory?.total_distance_km ? rideHistory.total_distance_km : 153.3;
  const co2Saved = (totalDist * 0.12).toFixed(1);

  return (
    <View style={styles.cardContainer}>
      {/* Header with Leaf Emblem & Level 3 Saver Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.leafIconBadge}>
            <Leaf size={16} color={THEME.colors.primaryDark} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Your Impact</Text>
            <Text style={styles.cardSubtitle}>Live NCR green commuter score</Text>
          </View>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level 3 Saver</Text>
        </View>
      </View>

      {/* EcoPoints Balance Banner */}
      <View style={styles.pointsBanner}>
        <View style={styles.pointsLeft}>
          <Coins size={22} color={THEME.colors.tertiary} />
          <View style={styles.pointsTextCol}>
            <Text style={styles.pointsAmount}>{ecoPoints} EcoPoints</Text>
            <Text style={styles.pointsDesc}>Available balance to redeem rewards</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.redeemButton}
          onPress={onRedeemPress}
          activeOpacity={0.8}
        >
          <Text style={styles.redeemText}>Redeem</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Badges Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <CloudLightning size={16} color={THEME.colors.primary} />
            <Text style={[styles.metricLabel, { color: THEME.colors.primary }]}>
              OFFSET
            </Text>
          </View>
          <Text style={styles.metricValue}>18.4 kg</Text>
          <Text style={styles.metricSub}>CO₂ saved this month</Text>
        </View>

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <QrCode size={16} color={THEME.colors.secondary} />
            <Text style={[styles.metricLabel, { color: THEME.colors.secondary }]}>
              ACTIVITY
            </Text>
          </View>
          <Text style={styles.metricValue}>{totalRides} Rides</Text>
          <Text style={styles.metricSub}>Delhi Electric Fleet</Text>
        </View>
      </View>

      {/* Weekly EV Rides Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Weekly EV Rides</Text>
          <View style={styles.zeroEmissionBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.zeroEmissionText}>100% Zero Emission</Text>
          </View>
        </View>

        <View style={styles.barGraphRow}>
          {[
            { day: "M", height: "48%", active: true },
            { day: "T", height: "72%", active: true },
            { day: "W", height: "35%", active: true },
            { day: "T", height: "85%", active: true },
            { day: "F", height: "95%", active: true },
            { day: "S", height: "20%", active: false },
            { day: "S", height: "40%", active: false },
          ].map((bar, i) => (
            <View key={i} style={styles.barColumn}>
              <View
                style={[
                  styles.barVisual,
                  {
                    height: bar.height,
                    backgroundColor: bar.active
                      ? THEME.colors.primary
                      : THEME.colors.surfaceContainerHigh || "#e6e9e7",
                  },
                ]}
              />
              <Text style={styles.dayLabel}>{bar.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 14,
    ...THEME.shadows.card,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  leafIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  levelBadge: {
    backgroundColor: "rgba(0, 107, 44, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.roundness.full,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 223, 154, 0.35)",
    padding: 12,
    borderRadius: THEME.roundness.lg,
  },
  pointsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  pointsTextCol: {
    flex: 1,
  },
  pointsAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  pointsDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  redeemButton: {
    backgroundColor: THEME.colors.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.roundness.md,
  },
  redeemText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.lg,
    padding: 12,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  metricSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.lg,
    padding: 12,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  zeroEmissionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.primary,
  },
  zeroEmissionText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  barGraphRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 60,
    gap: 8,
    paddingHorizontal: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: 4,
  },
  barVisual: {
    width: 14,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
  },
});
