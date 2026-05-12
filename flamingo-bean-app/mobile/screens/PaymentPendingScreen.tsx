import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";

type PaymentPendingScreenProps = NativeStackScreenProps<RootStackParamList, "PaymentPending">;

export function PaymentPendingScreen({ navigation, route }: PaymentPendingScreenProps) {
  const { checkout } = route.params;

  async function openCheckout() {
    await Linking.openURL(checkout.checkout_url);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Secure Checkout</Text>
          <Text style={styles.heading}>Waiting for payment confirmation</Text>
          <Text style={styles.message}>
            Your order is pending while Square processes payment. The cart is being kept until payment confirmation is
            wired in.
          </Text>

          <View style={styles.detailRows}>
            <DetailRow label="Order" value={checkout.local_order_number} />
            <DetailRow label="Status" value={formatLabel(checkout.status)} />
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={openCheckout}>
          <Text style={styles.primaryButtonText}>Open Square Checkout</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.secondaryButtonText}>Back to Cart</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f7f2",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 34,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  eyebrow: {
    color: "#d45d4c",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  heading: {
    color: "#18211f",
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 35,
  },
  message: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  detailRows: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    marginTop: 18,
  },
  detailRow: {
    borderBottomColor: "#d8e3dc",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  detailLabel: {
    color: "#687b73",
    fontSize: 14,
    fontWeight: "900",
  },
  detailValue: {
    color: "#25332f",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 18,
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "900",
  },
});

