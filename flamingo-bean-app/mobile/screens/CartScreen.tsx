import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useCart, type CartItem } from "../contexts/CartContext";
import { createCheckout } from "../services/checkout";
import type { RootStackParamList } from "../types/navigation";

type CartScreenProps = NativeStackScreenProps<RootStackParamList, "Cart">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function CartScreen({ navigation }: CartScreenProps) {
  const {
    items,
    clearCart,
    decreaseQuantity,
    getCartSubtotal,
    increaseQuantity,
    removeFromCart,
  } = useCart();
  const [customerName, setCustomerName] = useState("Flamingo Bean Guest");
  const [customerEmail, setCustomerEmail] = useState("guest@flamingobean.local");
  const [fulfillmentType, setFulfillmentType] = useState("pickup");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const isEmpty = items.length === 0;
  const canCheckout = !isEmpty && !isCheckingOut && customerName.trim().length > 0 && customerEmail.trim().length > 0;

  async function handleCheckout() {
    if (!canCheckout) {
      return;
    }

    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      setCheckoutMessage("Preparing secure Square checkout...");
      const checkout = await createCheckout({
        customerEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        fulfillmentType,
        items,
      });

      setCheckoutMessage("Redirecting to secure Square checkout...");
      await Linking.openURL(checkout.checkout_url);
      navigation.navigate("PaymentPending", { checkout });
    } catch {
      setCheckoutError("We could not start Square checkout. Please check the backend connection and try again.");
      setCheckoutMessage(null);
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {isEmpty ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Pick a coffee from the menu and it will show up here.</Text>
            <Pressable style={styles.menuButton} onPress={() => navigation.navigate("Products")}>
              <Text style={styles.menuButtonText}>Browse Menu</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.heading}>Your Order</Text>
              <Pressable onPress={clearCart} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear Cart</Text>
              </Pressable>
            </View>

            <View style={styles.items}>
              {items.map((item) => (
                <CartItemCard
                  item={item}
                  key={item.productId}
                  onDecrease={() => decreaseQuantity(item.productId)}
                  onIncrease={() => increaseQuantity(item.productId)}
                  onRemove={() => removeFromCart(item.productId)}
                />
              ))}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{currencyFormatter.format(getCartSubtotal())}</Text>
              </View>
              <Text style={styles.summaryNote}>Taxes, tips, and pickup timing will be handled later.</Text>
            </View>

            <View style={styles.checkoutCard}>
              <Text style={styles.checkoutTitle}>Checkout Details</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setCustomerName}
                placeholder="Customer name"
                placeholderTextColor="#8b9b95"
                style={styles.input}
                value={customerName}
              />
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setCustomerEmail}
                placeholder="Customer email"
                placeholderTextColor="#8b9b95"
                style={styles.input}
                value={customerEmail}
              />
              <View style={styles.fulfillmentRow}>
                <Pressable
                  onPress={() => setFulfillmentType("pickup")}
                  style={[
                    styles.fulfillmentOption,
                    fulfillmentType === "pickup" ? styles.fulfillmentOptionSelected : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.fulfillmentText,
                      fulfillmentType === "pickup" ? styles.fulfillmentTextSelected : null,
                    ]}
                  >
                    Pickup
                  </Text>
                </Pressable>
              </View>
            </View>

            {checkoutError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{checkoutError}</Text>
              </View>
            ) : null}

            {checkoutMessage ? (
              <View style={styles.checkoutMessageCard}>
                <Text style={styles.checkoutMessageText}>{checkoutMessage}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={!canCheckout}
              onPress={handleCheckout}
              style={({ pressed }) => [
                styles.checkoutButton,
                !canCheckout ? styles.checkoutButtonDisabled : null,
                pressed ? styles.checkoutButtonPressed : null,
              ]}
            >
              {isCheckingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

function CartItemCard({ item, onDecrease, onIncrease, onRemove }: CartItemCardProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemTopRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>{item.size}</Text>
          <Text style={styles.unitPrice}>{currencyFormatter.format(item.price)} each</Text>
        </View>
        <Text style={styles.lineTotal}>{currencyFormatter.format(lineTotal)}</Text>
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.quantityControls}>
          <Pressable accessibilityLabel={`Decrease ${item.name}`} onPress={onDecrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable accessibilityLabel={`Increase ${item.name}`} onPress={onIncrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>

        <Pressable onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
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
  emptyCard: {
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    color: "#18211f",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  menuButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heading: {
    color: "#18211f",
    fontSize: 30,
    fontWeight: "900",
  },
  clearButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "#d45d4c",
    fontSize: 14,
    fontWeight: "900",
  },
  items: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  itemTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  itemMeta: {
    color: "#687b73",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  unitPrice: {
    color: "#52635d",
    fontSize: 14,
    marginTop: 5,
  },
  lineTotal: {
    color: "#0f766e",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
  },
  controlsRow: {
    alignItems: "center",
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
  },
  quantityControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  quantityButton: {
    alignItems: "center",
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  quantityButtonText: {
    color: "#0f766e",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 23,
  },
  quantityText: {
    color: "#18211f",
    fontSize: 17,
    fontWeight: "900",
    minWidth: 22,
    textAlign: "center",
  },
  removeButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  removeButtonText: {
    color: "#d45d4c",
    fontSize: 14,
    fontWeight: "900",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
  },
  summaryValue: {
    color: "#0f766e",
    fontSize: 21,
    fontWeight: "900",
  },
  summaryNote: {
    color: "#687b73",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 18,
    paddingVertical: 15,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#9aa9a3",
  },
  checkoutButtonPressed: {
    opacity: 0.85,
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  checkoutCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  checkoutTitle: {
    color: "#18211f",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f8fbf7",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#18211f",
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  fulfillmentRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  fulfillmentOption: {
    alignItems: "center",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 11,
  },
  fulfillmentOptionSelected: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
  },
  fulfillmentText: {
    color: "#52635d",
    fontSize: 15,
    fontWeight: "900",
  },
  fulfillmentTextSelected: {
    color: "#0f766e",
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
  checkoutMessageCard: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 13,
  },
  checkoutMessageText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
  },
});
