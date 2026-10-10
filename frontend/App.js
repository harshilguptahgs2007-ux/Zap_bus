import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { RideHistoryScreen } from "./src/screens/RideHistoryScreen";
import { MarketplaceScreen } from "./src/screens/MarketplaceScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { THEME } from "./src/theme/theme";
import { MapPin, History, ShoppingBag, User } from "lucide-react-native";

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.dockWrapper}>
      <View style={styles.dockContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let IconComponent = MapPin;
          let label = "Home";
          if (route.name === "History") {
            IconComponent = History;
            label = "Activity";
          } else if (route.name === "Marketplace") {
            IconComponent = ShoppingBag;
            label = "Rewards";
          } else if (route.name === "Profile") {
            IconComponent = User;
            label = "Profile";
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <IconComponent
                size={20}
                color={isFocused ? THEME.colors.primary : THEME.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? THEME.colors.primary : THEME.colors.textSecondary },
                ]}
              >
                {label}
              </Text>
              {isFocused && <View style={styles.mintDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={RideHistoryScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.background} />
        <View style={styles.appContainer}>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  appContainer: {
    width: "100%",
    maxWidth: 440,
    height: "100%",
    backgroundColor: THEME.colors.background,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  dockWrapper: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  dockContainer: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    justifyContent: "space-around",
    alignItems: "center",
    ...THEME.shadows.dock,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.roundness.md,
    position: "relative",
  },
  tabButtonFocused: {
    backgroundColor: "rgba(5, 150, 105, 0.08)",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  mintDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.secondary,
    position: "absolute",
    bottom: -2,
  },
});
