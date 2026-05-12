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

import { ProductCard } from "../components/ProductCard";
import { fetchProducts } from "../services/products";
import type { RootStackParamList } from "../types/navigation";
import type { Product } from "../types/product";

type ProductsScreenProps = NativeStackScreenProps<RootStackParamList, "Products">;

export function ProductsScreen({ navigation }: ProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    try {
      setIsLoading(true);
      setError(null);
      const productList = await fetchProducts();
      setProducts(productList);
    } catch {
      setError("We could not load the coffee menu. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Flamingo Bean</Text>
          <Text style={styles.heading}>Coffee Menu</Text>
          <Text style={styles.subheading}>Fresh-roasted coffee for pickup and mobile ordering.</Text>
          <Pressable style={styles.adminButton} onPress={() => navigation.navigate("AdminOrders")}>
            <Text style={styles.adminButtonText}>Admin Orders</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#0f766e" size="large" />
            <Text style={styles.stateText}>Loading coffee menu...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Menu unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadProducts}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error ? (
          <View style={styles.productList}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate("ProductDetail", { product })}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#f4f7f2",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    marginBottom: 22,
    paddingTop: 10,
  },
  brand: {
    color: "#d45d4c",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heading: {
    color: "#18211f",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  subheading: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  adminButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  adminButtonText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
  },
  stateContainer: {
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
    fontWeight: "800",
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
    fontWeight: "800",
  },
  productList: {
    gap: 0,
  },
});
