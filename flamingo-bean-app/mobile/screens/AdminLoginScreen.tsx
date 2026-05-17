import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAdminAuth } from "../contexts/AdminAuthContext";
import { theme } from "../theme";

export function AdminLoginScreen() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleLogin() {
    if (!canSubmit) {
      setError("Enter your admin email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
    } catch {
      setError("We could not sign you in. Check your admin credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Staff Access</Text>
          <Text style={styles.heading}>Admin Login</Text>
          <Text style={styles.subheading}>Sign in to manage Flamingo Bean orders and products.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="admin@example.com"
              placeholderTextColor="#8b9b95"
              style={styles.input}
              textContentType="username"
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8b9b95"
              secureTextEntry
              style={styles.input}
              textContentType="password"
              value={password}
            />
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            disabled={!canSubmit}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              !canSubmit ? styles.loginButtonDisabled : null,
              pressed ? styles.loginButtonPressed : null,
            ]}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.adminBackground,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: "#d45d4c",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heading: {
    color: "#18211f",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  subheading: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  field: {
    marginBottom: 13,
  },
  fieldLabel: {
    color: "#25332f",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#f8fbf7",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#18211f",
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  errorCard: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 13,
    padding: 13,
  },
  errorText: {
    color: "#9f3528",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    paddingVertical: 15,
  },
  loginButtonDisabled: {
    backgroundColor: "#9aa9a3",
  },
  loginButtonPressed: {
    opacity: 0.85,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
});
