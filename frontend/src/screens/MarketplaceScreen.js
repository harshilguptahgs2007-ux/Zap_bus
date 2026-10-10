import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { THEME } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import {
  Gift,
  Zap,
  History,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart2,
  LineChart,
  Lock,
  X,
  Bus,
} from "lucide-react-native";

const MARKETPLACE_ITEMS = [
  {
    id: "1",
    name: "Stainless Steel Reusable Bottle",
    category: "Eco Essential",
    tagColor: THEME.colors.secondary,
    tagTextColor: "#ffffff",
    points: 250,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpPTvsZhcs9vX6i6Nz1nbRrtLWBhTyVAHpVNGsPSyCPXkazdNl5HXNv08ppoT8x6qJ8WKvBjEsw7w2H4pvEBTLkSr5Ez_JugED1eQiebB7DJtP6CJrE-CDkVU1MjkmHBc5iPom3vCjmkdZJvLnRhDDFc5N9idExahQedth3YofKjyWfeLep0sJZzvzZkdzSIe5pXXk4P-QNSXJr28v-4vX7JjojtIsXNFk900nXauaowKiXY9-Q3g6MQ",
    isLocked: false,
  },
  {
    id: "2",
    name: "Organic Cotton Tote Bag",
    category: "Zero Plastic",
    tagColor: THEME.colors.primary,
    tagTextColor: "#ffffff",
    points: 150,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwpoDkNsu4i0iH5xK5UGvf8zb-PM1c2O6ggEMfFDvFpPar1wdvHDNBfIfmbbOGkVuDLflAW9MwpSjoKD40vOfFhNq7v9wlQTMoD18CkdH689T_ceeMTGZjN5oFleKcomvSzkjR2Kz4DD4NTecJsdxERJcFQ0DBY52ufVTbTxjHzgVLsij5ViH_Gk4vitLgSHEiogrkvq-wgQi5thklmY217hHuR8ESvMjXBcr3e5nVAk1s0J9J56UKeg",
    isLocked: false,
  },
  {
    id: "3",
    name: "Bamboo Travel Coffee Mug",
    category: "Biodegradable",
    tagColor: THEME.colors.secondary,
    tagTextColor: "#ffffff",
    points: 200,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLwCj8bpJzWD8iOux0F8SDLQaw9_wqEgtTaPjlkdPErYsUVsj7HBuvzP-sTOZXi-N0tyCgadUA01UUZfbznn257db0rtnRG5uPct_-_i2J8R7MstEHsXD3WvrHxziwtxE5T2QCLyr5UmAeyepsQVNn2hqucr_BqHpTE3AvM-PGD_HtOJTRGGl1JRE34Wo0o4uIZl9mipvl8LdbfeR0Pra1SsU_JZee5fSc7bkama9U55kB_s69u3am-w",
    isLocked: false,
  },
  {
    id: "4",
    name: "₹100 Bus Ride Discount Coupon",
    category: "Instant Pass",
    tagColor: THEME.colors.tertiaryDark,
    tagTextColor: "#ffffff",
    points: 50,
    isCouponCard: true,
    isLocked: false,
  },
  {
    id: "5",
    name: "Plant a Teak Sapling in City Park",
    category: "Community Impact",
    tagColor: THEME.colors.primaryDark,
    tagTextColor: "#ffffff",
    points: 300,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8SZppiE5Z4CscGFOwjxZc40emvPoy8sO2j_GatxdUWcYXgbSaWhuI2N2w_HOkGMAJF_H8gHDoqgo2bu_7Yitt0UawFQU9RFL4LcWcu1oqaehggA037XC94eeG_Tkf_RNs5c70_d8z-NkJmRBdkhnrB_3oBE5HW156KL1pyFe6g4IKVg7j8rCWpVTehEMR9vIWKwgjo_o_jE_r4dGo9TvL-GK7-UqdCOuMbWoWVd4r0sOL-Ne01XHEpg",
    isLocked: false,
  },
  {
    id: "6",
    name: "Solar Power Bank (10,000 mAh)",
    category: "Clean Tech",
    tagColor: THEME.colors.textMuted,
    tagTextColor: "#ffffff",
    points: 600,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJJcJHdyCT2NF2jlhD5xhCUaN3eUwfuZVK17mreLEZAsSDGdX9RK4wfPmhTR41Q-bpkbsas4nDUKHMebvwDnjotzAwkML2rvz8Tr5KIIEcweUdXa-lDdwFiDmjEQBFFy_GZOo6KiNH1BBBVum9wpDW7uno4p84yX47aBn05zoKitLnLBkbxVEgPGvtr3ibbf1N1EVjwBAm0-jNruxbNWLN3Q8GfkLcRcYrjSPUIc-vNqXxA-s5zbRidg",
    isLocked: true,
  },
];

export const MarketplaceScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("rewards"); // 'rewards', 'earn', 'redemptions'
  const [chartMode, setChartMode] = useState("bar"); // 'bar', 'line'
  const [selectedReward, setSelectedReward] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const currentPoints = user?.eco_points_total || 420;

  const handleOpenRedeem = (item) => {
    setSelectedReward(item);
    setModalVisible(true);
  };

  const handleConfirmClaim = () => {
    if (!selectedReward) return;
    setModalVisible(false);
    Alert.alert(
      "🎉 Reward Redeemed!",
      `Successfully claimed "${selectedReward.name}". Voucher code sent to your verified email.`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Pill Tabs */}
        <View style={styles.pillTabsContainer}>
          <TouchableOpacity
            style={[
              styles.pillTab,
              activeTab === "rewards" && styles.pillTabActive,
            ]}
            onPress={() => setActiveTab("rewards")}
            activeOpacity={0.8}
          >
            <Gift
              size={15}
              color={activeTab === "rewards" ? "#ffffff" : THEME.colors.textSecondary}
            />
            <Text
              style={[
                styles.pillTabText,
                activeTab === "rewards" && styles.pillTabTextActive,
              ]}
            >
              Rewards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pillTab, activeTab === "earn" && styles.pillTabActive]}
            onPress={() => setActiveTab("earn")}
            activeOpacity={0.8}
          >
            <Zap
              size={15}
              color={activeTab === "earn" ? "#ffffff" : THEME.colors.textSecondary}
            />
            <Text
              style={[
                styles.pillTabText,
                activeTab === "earn" && styles.pillTabTextActive,
              ]}
            >
              Earn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillTab,
              activeTab === "redemptions" && styles.pillTabActive,
            ]}
            onPress={() => setActiveTab("redemptions")}
            activeOpacity={0.8}
          >
            <History
              size={15}
              color={activeTab === "redemptions" ? "#ffffff" : THEME.colors.textSecondary}
            />
            <Text
              style={[
                styles.pillTabText,
                activeTab === "redemptions" && styles.pillTabTextActive,
              ]}
            >
              My Redemptions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prominent Balance Card with Organic Backdrop */}
        <View style={styles.balanceCard}>
          <View style={styles.ambientGlow} />

          <View style={styles.balanceCardTop}>
            <View style={styles.verifiedTag}>
              <CheckCircle2 size={13} color={THEME.colors.primaryLight} />
              <Text style={styles.verifiedTagText}>VERIFIED BALANCE</Text>
            </View>

            <TouchableOpacity style={styles.ledgerBtn} activeOpacity={0.7}>
              <Text style={styles.ledgerBtnText}>Passbook & Ledger</Text>
              <ArrowRight size={13} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.pointsAmountRow}>
            <Text style={styles.bigPointsNum}>{currentPoints}</Text>
            <Text style={styles.bigPointsLabel}>EcoPoints</Text>
          </View>

          {/* Level Progress Indicator */}
          <View style={styles.levelProgressSection}>
            <View style={styles.levelHeaderRow}>
              <Text style={styles.levelTitleText}>🌿 Level 2: Green Commuter</Text>
              <Text style={styles.levelSubtitleText}>80 pts to Level 3</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: "84%" }]} />
            </View>
          </View>
        </View>

        {/* Instant Redemption Value Proposition Alert */}
        <View style={styles.valueAlertCard}>
          <View style={styles.valueIconCircle}>
            <CheckCircle2 size={18} color={THEME.colors.primary} />
          </View>
          <View style={styles.valueTextCol}>
            <Text style={styles.valueTitle}>Instant Redemption Available</Text>
            <Text style={styles.valueSub}>
              Redeem rewards immediately using your verified EcoPoints
            </Text>
          </View>
        </View>

        {/* Points Analytics & Trends Section */}
        <View style={styles.analyticsSection}>
          <View style={styles.analyticsHeaderRow}>
            <View style={styles.analyticsHeaderLeft}>
              <TrendingUp size={18} color={THEME.colors.primary} />
              <Text style={styles.analyticsTitle}>Points Analytics & Trends</Text>
            </View>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Updated Today</Text>
            </View>
          </View>

          {/* Activity Chart Container */}
          <View style={styles.chartCard}>
            <View style={styles.chartToggleHeader}>
              <Text style={styles.chartCardTitle}>EcoPoints Activity</Text>
              <View style={styles.chartToggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.chartToggleBtn,
                    chartMode === "bar" && styles.chartToggleBtnActive,
                  ]}
                  onPress={() => setChartMode("bar")}
                >
                  <BarChart2
                    size={12}
                    color={chartMode === "bar" ? "#ffffff" : THEME.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chartToggleText,
                      chartMode === "bar" && styles.chartToggleTextActive,
                    ]}
                  >
                    Bar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chartToggleBtn,
                    chartMode === "line" && styles.chartToggleBtnActive,
                  ]}
                  onPress={() => setChartMode("line")}
                >
                  <LineChart
                    size={12}
                    color={chartMode === "line" ? "#ffffff" : THEME.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.chartToggleText,
                      chartMode === "line" && styles.chartToggleTextActive,
                    ]}
                  >
                    Line
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {chartMode === "bar" ? (
              <View style={styles.barChartView}>
                <View style={styles.chartStatsRow}>
                  <Text style={styles.chartSubLabel}>This Week's Earned Points</Text>
                  <Text style={styles.chartValueLabel}>+145 pts</Text>
                </View>
                <View style={styles.barsContainer}>
                  {[
                    { day: "Mon", val: 15, h: 30, active: false },
                    { day: "Tue", val: 25, h: 48, active: false },
                    { day: "Wed", val: 10, h: 20, active: false },
                    { day: "Thu", val: 35, h: 65, active: false },
                    { day: "Fri", val: 20, h: 40, active: false },
                    { day: "Sat", val: 40, h: 80, active: true },
                    { day: "Sun", val: "--", h: 8, active: false },
                  ].map((bar, i) => (
                    <View key={i} style={styles.barCol}>
                      <Text
                        style={[
                          styles.barValText,
                          bar.active && { color: THEME.colors.primary, fontWeight: "700" },
                        ]}
                      >
                        {bar.val}
                      </Text>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${bar.h}%`,
                            backgroundColor: bar.active
                              ? THEME.colors.primary
                              : THEME.colors.primaryLight,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.barDayText,
                          bar.active && { color: THEME.colors.textPrimary, fontWeight: "700" },
                        ]}
                      >
                        {bar.day}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.lineChartView}>
                <View style={styles.chartStatsRow}>
                  <Text style={styles.chartSubLabel}>30-Day Cumulative Growth</Text>
                  <Text style={[styles.chartValueLabel, { color: THEME.colors.secondary }]}>
                    420 pts
                  </Text>
                </View>
                <View style={styles.svgLineContainer}>
                  <Svg width="100%" height="80" viewBox="0 0 300 80">
                    <Defs>
                      <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor="#006a63" stopOpacity="0.3" />
                        <Stop offset="100%" stopColor="#006a63" stopOpacity="0.0" />
                      </SvgLinearGradient>
                    </Defs>
                    <Path
                      d="M 0 65 Q 40 55, 80 50 T 160 38 T 230 22 T 300 8 L 300 80 L 0 80 Z"
                      fill="url(#lineGrad)"
                    />
                    <Path
                      d="M 0 65 Q 40 55, 80 50 T 160 38 T 230 22 T 300 8"
                      fill="none"
                      stroke="#006a63"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <Circle cx="80" cy="50" r="3.5" fill="#006a63" />
                    <Circle cx="160" cy="38" r="3.5" fill="#006a63" />
                    <Circle cx="230" cy="22" r="3.5" fill="#006a63" />
                    <Circle cx="300" cy="8" r="4" fill="#00873a" />
                  </Svg>
                  <View style={styles.lineXLabels}>
                    <Text style={styles.xLabel}>Week 1</Text>
                    <Text style={styles.xLabel}>Week 2</Text>
                    <Text style={styles.xLabel}>Week 3</Text>
                    <Text style={styles.xLabel}>Current</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Redeem Eco Rewards Grid Header */}
        <View style={styles.gridSectionHeader}>
          <View style={styles.gridTitleRow}>
            <Text style={styles.gridTitle}>Redeem Eco Rewards</Text>
            <View style={styles.availableBadge}>
              <Text style={styles.availableBadgeText}>6 Available</Text>
            </View>
          </View>
          <Text style={styles.gridSub}>
            Exchange points for sustainable gear & transit discounts
          </Text>
        </View>

        {/* 2-Column Marketplace Cards Grid */}
        <View style={styles.itemsGrid}>
          {MARKETPLACE_ITEMS.map((item) => (
            <View key={item.id} style={styles.rewardCard}>
              {/* Product Image / Coupon Container */}
              <View style={styles.imageBox}>
                <View
                  style={[styles.itemTag, { backgroundColor: item.tagColor }]}
                >
                  <Text style={[styles.itemTagText, { color: item.tagTextColor }]}>
                    {item.category}
                  </Text>
                </View>

                {item.isCouponCard ? (
                  <View style={styles.couponGraphic}>
                    <View style={styles.couponIconCircle}>
                      <Bus size={22} color="#ffffff" />
                    </View>
                    <Text style={styles.couponBigText}>₹100 OFF</Text>
                    <Text style={styles.couponSubText}>Valid on all EV rides</Text>
                  </View>
                ) : (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImg} />
                )}
              </View>

              {/* Title & Points Cost */}
              <View style={styles.cardInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.pointsCostRow}>
                  <Text
                    style={[
                      styles.productPoints,
                      item.isLocked && { color: THEME.colors.textMuted },
                    ]}
                  >
                    {item.points}
                  </Text>
                  <Text style={styles.productPointsSuffix}>pts</Text>
                </View>
              </View>

              {/* Action Button */}
              {item.isLocked ? (
                <View style={styles.lockedBtnContainer}>
                  <TouchableOpacity style={styles.lockedBtn} disabled>
                    <Lock size={13} color={THEME.colors.textMuted} />
                    <Text style={styles.lockedBtnText}>
                      Need {item.points - currentPoints} more pts
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.lockedCurrentSub}>You have {currentPoints} pts</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.redeemBtn}
                  onPress={() => handleOpenRedeem(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.redeemBtnText}>Redeem ({item.points} pts)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Dialog Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <CheckCircle2 size={20} color={THEME.colors.primary} />
                <Text style={styles.modalTitle}>Confirm Redemption</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={THEME.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSummaryBox}>
              <Text style={styles.modalItemName}>{selectedReward?.name}</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Points Required:</Text>
                <Text style={styles.modalDetailVal}>{selectedReward?.points} pts</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Balance after claim:</Text>
                <Text style={styles.modalBalanceVal}>
                  {currentPoints - (selectedReward?.points || 0)} pts
                </Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmClaim}
              >
                <Text style={styles.modalConfirmText}>Confirm & Claim</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  pillTabsContainer: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.full,
    padding: 4,
    gap: 4,
  },
  pillTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: THEME.roundness.full,
    gap: 5,
  },
  pillTabActive: {
    backgroundColor: THEME.colors.primary,
    ...THEME.shadows.card,
  },
  pillTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  pillTabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  balanceCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.xl,
    padding: 18,
    overflow: "hidden",
    position: "relative",
    ...THEME.shadows.float,
  },
  ambientGlow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(127, 252, 151, 0.15)",
  },
  balanceCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: THEME.colors.primaryLight,
    letterSpacing: 0.5,
  },
  ledgerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ledgerBtnText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  pointsAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  bigPointsNum: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -1,
  },
  bigPointsLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.primaryLight,
  },
  levelProgressSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    paddingTop: 10,
    marginTop: 8,
    gap: 6,
  },
  levelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelTitleText: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.primaryLight,
  },
  levelSubtitleText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: THEME.colors.primaryLight,
  },
  valueAlertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
    ...THEME.shadows.card,
  },
  valueIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  valueTextCol: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  valueSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  analyticsSection: {
    gap: 8,
  },
  analyticsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  analyticsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  todayBadge: {
    backgroundColor: "rgba(0, 107, 44, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.roundness.full,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
    ...THEME.shadows.card,
  },
  chartToggleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  chartToggleGroup: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.full,
    padding: 2,
    gap: 2,
  },
  chartToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.full,
    gap: 3,
  },
  chartToggleBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  chartToggleText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  chartToggleTextActive: {
    color: "#ffffff",
  },
  barChartView: {
    gap: 8,
  },
  chartStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  chartSubLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  chartValueLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  barsContainer: {
    flexDirection: "row",
    height: 100,
    alignItems: "flex-end",
    gap: 6,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: 4,
  },
  barValText: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  barFill: {
    width: "100%",
    maxWidth: 24,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barDayText: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  lineChartView: {
    gap: 8,
  },
  svgLineContainer: {
    paddingTop: 6,
  },
  lineXLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  xLabel: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  gridSectionHeader: {
    marginTop: 4,
    gap: 2,
  },
  gridTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  availableBadge: {
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: THEME.roundness.full,
  },
  availableBadgeText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  gridSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rewardCard: {
    width: "48.5%",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    justifyContent: "space-between",
    gap: 8,
    ...THEME.shadows.card,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: THEME.roundness.lg,
    backgroundColor: THEME.colors.surfaceSecondary,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  productImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemTag: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.roundness.full,
  },
  itemTagText: {
    fontSize: 9,
    fontWeight: "700",
  },
  couponGraphic: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    gap: 2,
  },
  couponIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  couponBigText: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.secondary,
  },
  couponSubText: {
    fontSize: 9,
    color: THEME.colors.textSecondary,
  },
  cardInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
    minHeight: 32,
  },
  pointsCostRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  productPoints: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  productPointsSuffix: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: "600",
  },
  redeemBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.md,
    paddingVertical: 8,
    alignItems: "center",
  },
  redeemBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  lockedBtnContainer: {
    gap: 4,
  },
  lockedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.md,
    paddingVertical: 7,
  },
  lockedBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  lockedCurrentSub: {
    fontSize: 9,
    textAlign: "center",
    color: THEME.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
    padding: 12,
    paddingBottom: 24,
  },
  modalCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 16,
    gap: 14,
    ...THEME.shadows.float,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  modalSummaryBox: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.lg,
    padding: 12,
    gap: 6,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalDetailLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  modalDetailVal: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: THEME.colors.surfaceBorder,
    marginVertical: 4,
  },
  modalBalanceVal: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textPrimary,
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSecondary,
    paddingVertical: 12,
    borderRadius: THEME.roundness.lg,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.roundness.lg,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
