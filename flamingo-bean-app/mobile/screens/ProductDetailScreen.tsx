import { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useCart } from "../contexts/CartContext";
import type { RootStackParamList } from "../types/navigation";

type ProductDetailScreenProps = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const hasImage = product.image_url.trim().length > 0;

  function handleAddToCart() {
    addToCart(product);
    setShowConfirmation(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Menu</Text>
        </Pressable>

        {hasImage ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderBrand}>Flamingo Bean</Text>
            <Text style={styles.placeholderText}>Coffee image coming soon</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.category}>{product.category}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{currencyFormatter.format(product.price)}</Text>
          </View>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Roast Level" value={product.roast_level} />
          <DetailRow label="Origin" value={product.origin} />
          <DetailRow label="Size" value={product.size} />
          <DetailRow label="Status" value={product.active ? "Available" : "Unavailable"} />
        </View>

        {showConfirmation ? (
          <View style={styles.confirmation}>
            <Text style={styles.confirmationText}>Added to cart.</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!product.active}
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.addToCartButton,
            !product.active ? styles.addToCartButtonDisabled : null,
            pressed ? styles.addToCartButtonPressed : null,
          ]}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f7f2",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 34,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingVertical: 4,
  },
  backButtonText: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
  },
  image: {
    aspectRatio: 1.55,
    backgroundColor: "#d8e3dc",
    borderRadius: 8,
    width: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    aspectRatio: 1.55,
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    width: "100%",
  },
  placeholderBrand: {
    color: "#d45d4c",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  placeholderText: {
    color: "#52635d",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    marginTop: 20,
  },
  category: {
    color: "#d45d4c",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  name: {
    color: "#18211f",
    flex: 1,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  price: {
    color: "#0f766e",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  description: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
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
    fontWeight: "700",
    textAlign: "right",
  },
  addToCartButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 15,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#9aa9a3",
  },
  addToCartButtonPressed: {
    opacity: 0.85,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  confirmation: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  confirmationText: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
  },
});
