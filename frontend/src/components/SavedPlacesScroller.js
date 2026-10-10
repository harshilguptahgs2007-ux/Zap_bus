import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Home, Briefcase, Star, Clock, Plus } from "lucide-react-native";
import { THEME } from "../theme/theme";

const SAVED_PLACES = [
  {
    id: "1",
    title: "Home",
    subtitle: "Sec 62, Noida",
    icon: Home,
    color: THEME.colors.secondary,
    bg: THEME.colors.secondaryContainer,
    lat: 28.6289,
    lng: 77.3649,
  },
  {
    id: "2",
    title: "Work",
    subtitle: "Cyber City, Gurugram",
    icon: Briefcase,
    color: THEME.colors.primary,
    bg: THEME.colors.surfaceSecondary,
    lat: 28.4986,
    lng: 77.0878,
  },
  {
    id: "3",
    title: "Connaught Pl.",
    subtitle: "Central Delhi",
    icon: Star,
    color: THEME.colors.tertiary,
    bg: THEME.colors.tertiaryLight,
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: "4",
    title: "Akshardham",
    subtitle: "Blue Line Metro",
    icon: Clock,
    color: THEME.colors.textSecondary,
    bg: THEME.colors.surfaceSecondary,
    lat: 28.6127,
    lng: 77.2773,
  },
  {
    id: "5",
    title: "India Gate",
    subtitle: "Kartavya Path",
    icon: Clock,
    color: THEME.colors.textSecondary,
    bg: THEME.colors.surfaceSecondary,
    lat: 28.6129,
    lng: 77.2295,
  },
];

export const SavedPlacesScroller = ({ onSelectPlace, onAddPlace }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Saved & Recent</Text>
        <Text style={styles.sectionSubtitle}>Delhi NCR Grid</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SAVED_PLACES.map((item) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.placeCard}
              onPress={() => onSelectPlace && onSelectPlace(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                <IconComponent size={18} color={item.color} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.placeCard, styles.addCard]}
          onPress={onAddPlace}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: THEME.colors.primaryLight }]}>
            <Plus size={18} color={THEME.colors.primaryDark} />
          </View>
          <Text style={styles.addText}>Add Place</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.secondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.roundness.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 10,
    ...THEME.shadows.card,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    maxWidth: 110,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  addCard: {
    borderColor: THEME.colors.primaryLight,
  },
  addText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
});
