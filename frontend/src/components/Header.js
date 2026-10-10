import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Bell, Leaf } from "lucide-react-native";
import { THEME } from "../theme/theme";
import { useAuth } from "../context/AuthContext";

export const Header = ({ onProfilePress }) => {
  const { user } = useAuth();
  const points = user?.eco_points_total || 420;

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Leaf size={18} color="#ffffff" />
        </View>
        <Text style={styles.brandTitle}>EcoRide</Text>
      </View>

      <View style={styles.actionsRow}>
        {/* Points Chip */}
        <View style={styles.pointsPill}>
          <Leaf size={14} color={THEME.colors.primary} />
          <Text style={styles.pointsText}>{points} pts</Text>
        </View>

        {/* Notifications Icon */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Bell size={18} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {/* Profile Avatar matching Stitch image */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJWliLsuGRHFHGij2X10zMkErLuxrTgjQtbshlta1Nq6mEIMmY_-gT28CLGQ2vYislRZjhnV9vjiHho531-6sp9kOIlrg82A-azz-67rPmu7Oa6ux-Hg_5o9yP7SlbzRynzOrmdSMZ36mjGrvMejU26Of6vUZAcE81kQfb3Dd_dH6s_ZXXxhieJGBasYBVDP2qR9U9vxKyER1Vpjs2kN2RxHgK3O-IAf4Kdqp90cWxkGm71O-xC4V1Wg",
            }}
            style={styles.avatarImg}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: THEME.roundness.md,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 107, 44, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.roundness.full,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
});
