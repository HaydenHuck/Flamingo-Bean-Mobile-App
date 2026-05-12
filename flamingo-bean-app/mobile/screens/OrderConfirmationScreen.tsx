import { useState } from "react";
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

import { fetchOrder } from "../services/orders";
import type { RootStackParamList } from "../types/navigation";
import type { OrderConfirmation, OrderItemResponse, OrderStatus } from "../types/order";

type OrderConfirmationScreenProps = NativeStackScreenProps<RootStackParamList, "OrderConfirmation">;

const TRACKING_STEPS: OrderStatus[] = ["received", "preparing", "ready", "completed"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function OrderConfirmationScreen({ navigation, route }: OrderConfirmationScreenProps) {
  const [order, setOrder] = useState<OrderConfirmation>(route.params.order);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    try {
      setIsRefreshing(true);
      setError(null);
      const updatedOrder = await fetchOrder(order.order_number);
      setOrder(updatedOrder);
    } catch {
      setError("We could not refresh this order. Please try again in a moment.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.confirmationCard}>
          <Text style={styles.eyebrow}>Order Tracking</Text>
          <Text style={styles.heading}>Thanks, {order.customer_name}</Text>
          <Text style={styles.message}>{getCustomerMessage(order)}</Text>

          <View style={styles.orderNumberBox}>
            <Text style={styles.orderNumberLabel}>Order Number</Text>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <View style={styles.statusGroup}>
              <Text style={styles.statusLabel}>Payment</Text>
              <Text style={[styles.statusValue, getPaymentStatusStyle(order.payment_status)]}>
                {formatStatus(order.payment_status)}
              </Text>
            </View>
            <View style={styles.statusGroupRight}>
              <Text style={styles.statusLabel}>Order</Text>
              <Text style={styles.statusValue}>{formatStatus(order.status)}</Text>
            </View>
          </View>

          <Text style={styles.paymentMessage}>{getPaymentMessage(order)}</Text>

          <Pressable
            disabled={isRefreshing}
            onPress={handleRefresh}
            style={({ pressed }) => [
              styles.refreshButton,
              isRefreshing ? styles.refreshButtonDisabled : null,
              pressed ? styles.refreshButtonPressed : null,
            ]}
          >
            {isRefreshing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh Status</Text>
            )}
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          {TRACKING_STEPS.map((step) => (
            <TimelineStep key={step} order={order} step={step} />
          ))}
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Customer" value={order.customer_name} />
          <DetailRow label="Fulfillment" value={formatStatus(order.fulfillment_type)} />
          <DetailRow label="Created" value={formatDate(order.created_at)} />
          <DetailRow label="Updated" value={formatDate(order.updated_at)} />
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <OrderItemRow item={item} key={`${item.product_id}-${item.name}-${item.size}`} />
          ))}
        </View>

        <View style={styles.totalsCard}>
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

interface TimelineStepProps {
  order: OrderConfirmation;
  step: OrderStatus;
}

function TimelineStep({ order, step }: TimelineStepProps) {
  const stepState = getTimelineStepState(order.status, step);

  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineDot,
          stepState === "complete" ? styles.timelineDotComplete : null,
          stepState === "current" ? styles.timelineDotCurrent : null,
        ]}
      >
        <Text style={[styles.timelineDotText, stepState === "upcoming" ? styles.timelineDotTextUpcoming : null]}>
          {stepState === "current" ? "" : ""}
        </Text>
      </View>
      <View style={styles.timelineTextGroup}>
        <Text style={[styles.timelineTitle, stepState === "upcoming" ? styles.timelineTitleUpcoming : null]}>
          {formatStatus(step)}
        </Text>
        <Text style={styles.timelineHelp}>{getTimelineHelp(step)}</Text>
      </View>
    </View>
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

interface OrderItemRowProps {
  item: OrderItemResponse;
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

function getCustomerMessage(order: OrderConfirmation) {
  if (order.status === "ready") {
    return "Your order is ready for pickup.";
  }

  if (order.payment_status === "pending_payment") {
    return "Waiting for payment confirmation...";
  }

  if (order.payment_status === "paid") {
    return "Payment confirmed. We will keep this page updated as your coffee moves along.";
  }

  if (order.payment_status === "payment_failed") {
    return "Payment did not complete. Please return to checkout or ask the cafe team for help.";
  }

  if (order.payment_status === "canceled" || order.status === "canceled") {
    return "This order has been canceled.";
  }

  return "We have your Flamingo Bean order and will prepare it for pickup.";
}

function getPaymentMessage(order: OrderConfirmation) {
  if (order.payment_status === "pending_payment") {
    return "Waiting for payment confirmation...";
  }

  if (order.payment_status === "paid") {
    return "Payment confirmed.";
  }

  if (order.payment_status === "payment_failed") {
    return "Payment failed.";
  }

  return "Payment canceled.";
}

function getTimelineStepState(currentStatus: OrderStatus, step: OrderStatus) {
  const currentIndex = TRACKING_STEPS.indexOf(currentStatus);
  const stepIndex = TRACKING_STEPS.indexOf(step);

  if (currentIndex === -1) {
    return "upcoming";
  }

  if (stepIndex < currentIndex) {
    return "complete";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
}

function getTimelineHelp(step: OrderStatus) {
  switch (step) {
    case "received":
      return "The cafe has received your order.";
    case "preparing":
      return "Your coffee is being prepared.";
    case "ready":
      return "Your order is ready for pickup.";
    case "completed":
      return "The order has been picked up.";
    default:
      return "";
  }
}

function getPaymentStatusStyle(paymentStatus: string) {
  if (paymentStatus === "paid") {
    return styles.paidText;
  }

  if (paymentStatus === "pending_payment") {
    return styles.pendingText;
  }

  return styles.problemText;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
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
  orderNumberBox: {
    backgroundColor: "#ffffff",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 13,
  },
  orderNumberLabel: {
    color: "#687b73",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  orderNumber: {
    color: "#0f766e",
    fontSize: 21,
    fontWeight: "900",
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  statusTopRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  statusGroup: {
    flex: 1,
  },
  statusGroupRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  statusLabel: {
    color: "#687b73",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  statusValue: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
  },
  paidText: {
    color: "#0f766e",
  },
  pendingText: {
    color: "#d45d4c",
  },
  problemText: {
    color: "#9f3528",
  },
  paymentMessage: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    color: "#52635d",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 14,
    paddingTop: 14,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 16,
    minHeight: 48,
    justifyContent: "center",
  },
  refreshButtonDisabled: {
    backgroundColor: "#9aa9a3",
  },
  refreshButtonPressed: {
    opacity: 0.85,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  errorCard: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 13,
  },
  errorText: {
    color: "#9f3528",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  sectionTitle: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 14,
  },
  timelineDot: {
    alignItems: "center",
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    marginTop: 1,
    width: 28,
  },
  timelineDotCurrent: {
    backgroundColor: "#0f766e",
    borderColor: "#0f766e",
  },
  timelineDotComplete: {
    backgroundColor: "#9fcfbd",
    borderColor: "#9fcfbd",
  },
  timelineDotText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
  },
  timelineDotTextUpcoming: {
    color: "#9aa9a3",
  },
  timelineTextGroup: {
    flex: 1,
  },
  timelineTitle: {
    color: "#18211f",
    fontSize: 16,
    fontWeight: "900",
  },
  timelineTitleUpcoming: {
    color: "#687b73",
  },
  timelineHelp: {
    color: "#52635d",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  itemsCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
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
  totalsCard: {
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
    backgroundColor: "#ffffff",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    paddingVertical: 15,
  },
  menuButtonText: {
    color: "#0f766e",
    fontSize: 16,
    fontWeight: "900",
  },
});
