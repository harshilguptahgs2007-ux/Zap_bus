import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { THEME } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import { Zap, ShieldCheck } from "lucide-react-native";

export const AuthScreen = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("25");
  const [contact, setContact] = useState("+919876543210");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Missing Fields", "Please enter your username and password");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        if (!email) {
          Alert.alert("Missing Email", "Please enter an email address");
          setSubmitting(false);
          return;
        }
        await register({
          user: username.trim(),
          pass_: password,
          email: email.trim().toLowerCase(),
          age: parseInt(age) || 25,
          contact: contact.trim(),
          latitude: 28.6139,
          longitude: 77.2090,
        });
      } else {
        await login(username.trim(), password);
      }
    } catch (e) {
      Alert.alert("Authentication Failed", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Zap size={32} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>EcoRide</Text>
          <Text style={styles.brandSubtitle}>
            Zero-Emission Public Transit & Real-Time Tracking
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabToggle}>
            <TouchableOpacity
              style={[styles.tabBtn, !isRegister && styles.tabBtnActive]}
              onPress={() => setIsRegister(false)}
            >
              <Text
                style={[styles.tabBtnText, !isRegister && styles.tabBtnTextActive]}
              >
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, isRegister && styles.tabBtnActive]}
              onPress={() => setIsRegister(true)}
            >
              <Text
                style={[styles.tabBtnText, isRegister && styles.tabBtnTextActive]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {isRegister && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="user@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="25"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Phone Contact</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="+919876543210"
                      value={contact}
                      onChangeText={setContact}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {submitting
                  ? "Connecting..."
                  : isRegister
                  ? "Create Account & Start Earning"
                  : "Sign In to EcoRide"}
              </Text>
            </TouchableOpacity>

            <View style={styles.secureBadge}>
              <ShieldCheck size={14} color={THEME.colors.primary} />
              <Text style={styles.secureText}>
                Secured with OAuth2 + Bcrypt + Redis Live Sync
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  brandHero: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...THEME.shadows.float,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 240,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.roundness.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    ...THEME.shadows.card,
  },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.roundness.lg,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: THEME.roundness.md,
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    ...THEME.shadows.card,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  tabBtnTextActive: {
    color: THEME.colors.textPrimary,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
  },
  input: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: THEME.roundness.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.roundness.lg,
    alignItems: "center",
    marginTop: 8,
    ...THEME.shadows.float,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  secureText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
});
