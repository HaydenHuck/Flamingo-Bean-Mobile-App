import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "../contexts/CartContext";

interface CartHeaderButtonProps {
  onPress: () => void;
}

export function CartHeaderButton({ onPress }: CartHeaderButtonProps) {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>Cart</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{itemCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  buttonText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
  },
  badge: {
    alignItems: "center",
    backgroundColor: "#d45d4c",
    borderRadius: 8,
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
});

