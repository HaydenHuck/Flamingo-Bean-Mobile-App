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

import { fetchAdminProducts, updateAdminProductActive } from "../services/adminProducts";
import type { RootStackParamList } from "../types/navigation";
import type { Product } from "../types/product";

type AdminProductsScreenProps = NativeStackScreenProps<RootStackParamList, "AdminProducts">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function AdminProductsScreen({ navigation }: AdminProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);

  async function loadProducts() {
    try {
      setIsLoading(true);
      setError(null);
      const productList = await fetchAdminProducts();
      setProducts(productList);
    } catch {
      setError("We could not load products. Please check the backend connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleActiveToggle(product: Product) {
    try {
      setUpdatingProductId(product.id);
      const updatedProduct = await updateAdminProductActive(product.id, !product.active);
      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === updatedProduct.id ? updatedProduct : currentProduct,
        ),
      );
    } catch {
      setError("We could not update that product. Please try again.");
    } finally {
      setUpdatingProductId(null);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Staff</Text>
          <Text style={styles.heading}>Admin Products</Text>
          <Text style={styles.subheading}>Manage menu items and availability for local development.</Text>
          <Pressable style={styles.addButton} onPress={() => navigation.navigate("AdminProductForm")}>
            <Text style={styles.addButtonText}>Add Product</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#0f766e" size="large" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Products unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadProducts} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Add the first Flamingo Bean product to start building the menu.</Text>
          </View>
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <View style={styles.productList}>
            {products.map((product) => (
              <AdminProductCard
                isUpdating={updatingProductId === product.id}
                key={product.id}
                onEdit={() => navigation.navigate("AdminProductForm", { product })}
                onToggleActive={() => void handleActiveToggle(product)}
                product={product}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AdminProductCardProps {
  product: Product;
  isUpdating: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}

function AdminProductCard({ product, isUpdating, onEdit, onToggleActive }: AdminProductCardProps) {
  return (
    <View style={[styles.productCard, !product.active ? styles.inactiveCard : null]}>
      <Pressable onPress={onEdit} style={({ pressed }) => [styles.productBody, pressed ? styles.cardPressed : null]}>
        <View style={styles.productTopRow}>
          <View style={styles.productTitleGroup}>
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.productName}>{product.name}</Text>
          </View>
          <View style={[styles.statusBadge, !product.active ? styles.inactiveBadge : null]}>
            <Text style={[styles.statusText, !product.active ? styles.inactiveStatusText : null]}>
              {product.active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <Detail label="Size" value={product.size} />
          <Detail label="Price" value={currencyFormatter.format(product.price)} />
          <Detail label="Roast" value={product.roast_level || "Not set"} />
          <Detail label="Origin" value={product.origin || "Not set"} />
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable onPress={onEdit} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
        <Pressable disabled={isUpdating} onPress={onToggleActive} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {isUpdating ? "Updating..." : product.active ? "Disable" : "Enable"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface DetailProps {
  label: string;
  value: string;
}

function Detail({ label, value }: DetailProps) {
  return (
    <View style={styles.detailItem}>
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
  header: {
    marginBottom: 20,
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
  addButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
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
  productList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  inactiveCard: {
    opacity: 0.72,
  },
  productBody: {
    padding: 16,
  },
  cardPressed: {
    opacity: 0.84,
  },
  productTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  productTitleGroup: {
    flex: 1,
  },
  category: {
    color: "#d45d4c",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  productName: {
    color: "#18211f",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
  },
  statusBadge: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inactiveBadge: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
  },
  statusText: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "900",
  },
  inactiveStatusText: {
    color: "#9f3528",
  },
  detailGrid: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
  },
  detailItem: {
    minWidth: "44%",
  },
  detailLabel: {
    color: "#687b73",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  detailValue: {
    color: "#25332f",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  actionsRow: {
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
  },
  editButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 13,
  },
  editButtonText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
  },
  toggleButton: {
    alignItems: "center",
    borderLeftColor: "#d8e3dc",
    borderLeftWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  toggleButtonText: {
    color: "#d45d4c",
    fontSize: 14,
    fontWeight: "900",
  },
});

