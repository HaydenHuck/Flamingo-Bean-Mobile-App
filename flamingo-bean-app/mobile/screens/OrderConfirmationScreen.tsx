import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../types/navigation";

type OrderConfirmationScreenProps = NativeStackScreenProps<RootStackParamList, "OrderConfirmation">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function OrderConfirmationScreen({ navigation, route }: OrderConfirmationScreenProps) {
  const { order } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.confirmationCard}>
          <Text style={styles.eyebrow}>Order Received</Text>
          <Text style={styles.heading}>Thanks, {order.customer_name}</Text>
          <Text style={styles.message}>We have your Flamingo Bean order and will prepare it for pickup.</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Order ID" value={order.order_id} />
          <DetailRow label="Status" value={formatStatus(order.status)} />
          <DetailRow label="Customer" value={order.customer_name} />
          <DetailRow label="Fulfillment" value={formatStatus(order.fulfillment_type)} />
          <DetailRow label="Subtotal" value={currencyFormatter.format(order.subtotal)} />
          <DetailRow label="Tax" value={currencyFormatter.format(order.tax)} />
          <DetailRow label="Total" value={currencyFormatter.format(order.total)} isTotal />
        </View>

        <Pressable style={styles.menuButton} onPress={() => navigation.navigate("Products")}>
          <Text style={styles.menuButtonText}>Back to Menu</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
}

function DetailRow({ label, value, isTotal = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, isTotal ? styles.totalLabel : null]}>{label}</Text>
      <Text style={[styles.detailValue, isTotal ? styles.totalValue : null]}>{value}</Text>
    </View>
  );
}

function formatStatus(value: string) {
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
  confirmationCard: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  heading: {
    color: "#18211f",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  message: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  detailRow: {
    borderBottomColor: "#d8e3dc",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  detailLabel: {
    color: "#687b73",
    fontSize: 14,
    fontWeight: "800",
  },
  detailValue: {
    color: "#25332f",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  totalLabel: {
    color: "#18211f",
    fontSize: 17,
  },
  totalValue: {
    color: "#0f766e",
    fontSize: 19,
    fontWeight: "900",
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 15,
  },
  menuButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
});

