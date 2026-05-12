import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      accessibilityLabel={`View ${product.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
        </View>
        <Text style={styles.price}>{currencyFormatter.format(product.price)}</Text>
      </View>

      <Text style={styles.description}>{product.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Roast</Text>
          <Text style={styles.detailValue}>{product.roast_level}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Origin</Text>
          <Text style={styles.detailValue}>{product.origin}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>{product.size}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#16322d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
  },
  category: {
    color: "#d45d4c",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  name: {
    color: "#18211f",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
  },
  price: {
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: "#52635d",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  details: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: "#687b73",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#25332f",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
});
