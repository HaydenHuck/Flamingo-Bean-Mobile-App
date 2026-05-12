import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAdminAuth } from "../contexts/AdminAuthContext";
import { isAuthError } from "../services/api";
import { fetchAdminOrders } from "../services/adminOrders";
import { AdminLoginScreen } from "./AdminLoginScreen";
import type { RootStackParamList } from "../types/navigation";
import type { AdminOrderSummary } from "../types/order";

type AdminOrdersScreenProps = NativeStackScreenProps<RootStackParamList, "AdminOrders">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function AdminOrdersScreen({ navigation }: AdminOrdersScreenProps) {
  const { accessToken, adminUser, isAuthenticated, isLoading: isAuthLoading, logout } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    if (!accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const orderList = await fetchAdminOrders(accessToken);
      setOrders(orderList);
    } catch (loadError) {
      if (isAuthError(loadError)) {
        await logout();
        return;
      }

      setError("We could not load orders. Please check the backend connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [accessToken]),
  );

  if (isAuthLoading) {
    return <AdminAuthLoadingScreen />;
  }

  if (!isAuthenticated || !accessToken) {
    return <AdminLoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.adminTopRow}>
            <Text style={styles.eyebrow}>Staff</Text>
            <Pressable style={styles.logoutButton} onPress={() => void logout()}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
          <Text style={styles.heading}>Admin Orders</Text>
          <Text style={styles.subheading}>View local development orders and manage status updates.</Text>
          {adminUser ? <Text style={styles.signedInText}>Signed in as {adminUser.email}</Text> : null}
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#0f766e" size="large" />
            <Text style={styles.stateText}>Loading orders...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Orders unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadOrders} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Customer checkout orders will appear here.</Text>
          </View>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <View style={styles.orderList}>
            {orders.map((order) => (
              <AdminOrderCard
                key={order.order_id}
                order={order}
                onPress={() => navigation.navigate("AdminOrderDetail", { orderId: order.order_id })}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminAuthLoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authLoadingContent}>
        <ActivityIndicator color="#0f766e" size="large" />
        <Text style={styles.stateText}>Checking admin session...</Text>
      </View>
    </SafeAreaView>
  );
}

interface AdminOrderCardProps {
  order: AdminOrderSummary;
  onPress: () => void;
}

function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.orderCard, pressed ? styles.cardPressed : null]}>
      <View style={styles.orderTopRow}>
        <View style={styles.orderTitleGroup}>
          <Text style={styles.orderId}>{order.order_id}</Text>
          <Text style={styles.customerName}>{order.customer_name}</Text>
        </View>
        <View style={[styles.statusBadge, getPaymentBadgeStyle(order.payment_status)]}>
          <Text style={styles.statusText}>{formatLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderMetaRow}>
        <Text style={styles.metaText}>{formatLabel(order.fulfillment_type)}</Text>
        <Text style={[styles.paymentText, getPaymentTextStyle(order.payment_status)]}>
          Payment: {formatLabel(order.payment_status)}
        </Text>
        <Text style={styles.metaText}>{formatDate(order.created_at)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{currencyFormatter.format(order.total)}</Text>
      </View>
    </Pressable>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPaymentBadgeStyle(paymentStatus: string) {
  if (paymentStatus === "pending_payment") {
    return styles.pendingBadge;
  }

  if (paymentStatus === "paid") {
    return styles.paidBadge;
  }

  return styles.problemBadge;
}

function getPaymentTextStyle(paymentStatus: string) {
  if (paymentStatus === "pending_payment") {
    return styles.pendingPaymentText;
  }

  if (paymentStatus === "paid") {
    return styles.paidPaymentText;
  }

  return styles.problemPaymentText;
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
  header: {
    marginBottom: 20,
  },
  adminTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  signedInText: {
    color: "#687b73",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutButtonText: {
    color: "#d45d4c",
    fontSize: 13,
    fontWeight: "900",
  },
  authLoadingContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 24,
  },
  stateText: {
    color: "#52635d",
    fontSize: 15,
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  errorTitle: {
    color: "#9f3528",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },
  errorText: {
    color: "#684a44",
    fontSize: 15,
    lineHeight: 22,
  },
  retryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    color: "#18211f",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 7,
  },
  emptyText: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
  },
  orderList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.84,
  },
  orderTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  orderTitleGroup: {
    flex: 1,
  },
  orderId: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  customerName: {
    color: "#18211f",
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 24,
  },
  statusBadge: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingBadge: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
  },
  paidBadge: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
  },
  problemBadge: {
    backgroundColor: "#f7ecec",
    borderColor: "#e6a8a8",
  },
  statusText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "900",
  },
  orderMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  metaText: {
    color: "#52635d",
    fontSize: 14,
    fontWeight: "700",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "900",
  },
  pendingPaymentText: {
    color: "#d45d4c",
  },
  paidPaymentText: {
    color: "#0f766e",
  },
  problemPaymentText: {
    color: "#9f3528",
  },
  totalRow: {
    alignItems: "center",
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
  },
  totalLabel: {
    color: "#687b73",
    fontSize: 14,
    fontWeight: "900",
  },
  totalValue: {
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "900",
  },
});

