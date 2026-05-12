import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAdminAuth } from "../contexts/AdminAuthContext";
import { isAuthError } from "../services/api";
import { fetchAdminOrder, updateAdminOrderStatus } from "../services/adminOrders";
import { AdminLoginScreen } from "./AdminLoginScreen";
import type { RootStackParamList } from "../types/navigation";
import type { AdminOrderDetail, AdminOrderItem, OrderStatus } from "../types/order";

type AdminOrderDetailScreenProps = NativeStackScreenProps<RootStackParamList, "AdminOrderDetail">;

const ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "payment_failed",
  "received",
  "preparing",
  "ready",
  "completed",
  "canceled",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function AdminOrderDetailScreen({ route }: AdminOrderDetailScreenProps) {
  const { orderId } = route.params;
  const { accessToken, isAuthenticated, isLoading: isAuthLoading, logout } = useAdminAuth();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);

  async function loadOrder() {
    if (!accessToken) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const orderDetail = await fetchAdminOrder(orderId, accessToken);
      setOrder(orderDetail);
    } catch (loadError) {
      if (isAuthError(loadError)) {
        await logout();
        return;
      }

      setError("We could not load this order. Please check the backend connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    if (!order || !accessToken || order.status === status || updatingStatus) {
      return;
    }

    try {
      setUpdatingStatus(status);
      setStatusError(null);
      const updatedOrder = await updateAdminOrderStatus(order.order_id, status, accessToken);
      setOrder(updatedOrder);
    } catch (updateError) {
      if (isAuthError(updateError)) {
        await logout();
        return;
      }

      setStatusError("We could not update the order status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  }

  useEffect(() => {
    void loadOrder();
  }, [orderId, accessToken]);

  if (isAuthLoading) {
    return <AdminAuthLoadingScreen />;
  }

  if (!isAuthenticated || !accessToken) {
    return <AdminLoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.adminTopRow}>
          <Text style={styles.eyebrow}>Staff</Text>
          <Pressable style={styles.logoutButton} onPress={() => void logout()}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#0f766e" size="large" />
            <Text style={styles.stateText}>Loading order...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Order unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadOrder} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && order ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.orderId}>{order.order_id}</Text>
              <Text style={styles.customerName}>{order.customer_name}</Text>
              <Text style={styles.customerEmail}>{order.customer_email}</Text>

              <View style={styles.detailRows}>
                <DetailRow label="Status" value={formatLabel(order.status)} />
                <DetailRow label="Payment" value={formatLabel(order.payment_status)} />
                <DetailRow label="Fulfillment" value={formatLabel(order.fulfillment_type)} />
                <DetailRow label="Subtotal" value={currencyFormatter.format(order.subtotal)} />
                <DetailRow label="Tax" value={currencyFormatter.format(order.tax)} />
                <DetailRow label="Total" value={currencyFormatter.format(order.total)} strong />
              </View>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.sectionTitle}>Update Status</Text>
              <View style={styles.statusGrid}>
                {ORDER_STATUSES.map((status) => (
                  <Pressable
                    disabled={updatingStatus !== null || order.status === status}
                    key={status}
                    onPress={() => void handleStatusChange(status)}
                    style={[
                      styles.statusButton,
                      order.status === status ? styles.statusButtonSelected : null,
                      updatingStatus === status ? styles.statusButtonUpdating : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        order.status === status ? styles.statusButtonTextSelected : null,
                      ]}
                    >
                      {updatingStatus === status ? "Updating..." : formatLabel(status)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {statusError ? <Text style={styles.statusError}>{statusError}</Text> : null}
            </View>

            <View style={styles.itemsCard}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {order.items.map((item) => (
                <OrderItemRow item={item} key={`${item.product_id}-${item.name}-${item.size}`} />
              ))}
            </View>
          </>
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

interface DetailRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

function DetailRow({ label, value, strong = false }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, strong ? styles.strongLabel : null]}>{label}</Text>
      <Text style={[styles.detailValue, strong ? styles.strongValue : null]}>{value}</Text>
    </View>
  );
}

interface OrderItemRowProps {
  item: AdminOrderItem;
}

function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {item.size} x {item.quantity} at {currencyFormatter.format(item.price)}
        </Text>
      </View>
      <Text style={styles.itemTotal}>{currencyFormatter.format(item.line_total)}</Text>
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
  adminTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  eyebrow: {
    color: "#d45d4c",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
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
  summaryCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  orderId: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 5,
  },
  customerName: {
    color: "#18211f",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },
  customerEmail: {
    color: "#52635d",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  detailRows: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    marginTop: 16,
  },
  detailRow: {
    borderBottomColor: "#d8e3dc",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    paddingVertical: 13,
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
    fontWeight: "800",
    textAlign: "right",
  },
  strongLabel: {
    color: "#18211f",
    fontSize: 16,
  },
  strongValue: {
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "900",
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  statusButton: {
    backgroundColor: "#f8fbf7",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusButtonSelected: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
  },
  statusButtonUpdating: {
    opacity: 0.72,
  },
  statusButtonText: {
    color: "#52635d",
    fontSize: 14,
    fontWeight: "900",
  },
  statusButtonTextSelected: {
    color: "#0f766e",
  },
  statusError: {
    color: "#9f3528",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 12,
  },
  itemsCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  itemRow: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: "#18211f",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  itemMeta: {
    color: "#52635d",
    fontSize: 14,
    marginTop: 4,
  },
  itemTotal: {
    color: "#0f766e",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 1,
  },
});

