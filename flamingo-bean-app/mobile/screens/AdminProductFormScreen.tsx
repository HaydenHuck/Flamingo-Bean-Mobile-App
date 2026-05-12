import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { createAdminProduct, updateAdminProduct } from "../services/adminProducts";
import type { RootStackParamList } from "../types/navigation";
import type { AdminProductPayload } from "../types/product";

type AdminProductFormScreenProps = NativeStackScreenProps<RootStackParamList, "AdminProductForm">;

export function AdminProductFormScreen({ navigation, route }: AdminProductFormScreenProps) {
  const product = route.params?.product;
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [roastLevel, setRoastLevel] = useState(product?.roast_level ?? "");
  const [origin, setOrigin] = useState(product?.origin ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedPrice = Number(price);
  const canSave =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    size.trim().length > 0 &&
    Number.isFinite(parsedPrice) &&
    parsedPrice >= 0 &&
    !isSaving;

  async function handleSave() {
    if (!canSave) {
      setError("Please fill out the required fields and enter a valid price.");
      return;
    }

    const payload: AdminProductPayload = {
      active,
      category: category.trim(),
      description: description.trim(),
      image_url: imageUrl.trim(),
      name: name.trim(),
      origin: origin.trim(),
      price: parsedPrice,
      roast_level: roastLevel.trim(),
      size: size.trim(),
    };

    try {
      setIsSaving(true);
      setError(null);

      if (product) {
        await updateAdminProduct(product.id, payload);
      } else {
        await createAdminProduct(payload);
      }

      navigation.navigate("AdminProducts");
    } catch {
      setError("We could not save this product. Please check the backend connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isEditing ? "Edit Product" : "New Product"}</Text>
          <Text style={styles.heading}>{isEditing ? product?.name : "Add Product"}</Text>
          <Text style={styles.subheading}>Update menu details and availability for the customer product list.</Text>
        </View>

        <View style={styles.formCard}>
          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Description" multiline value={description} onChangeText={setDescription} />
          <Field label="Category" value={category} onChangeText={setCategory} />
          <Field keyboardType="decimal-pad" label="Price" value={price} onChangeText={setPrice} />
          <Field label="Size" value={size} onChangeText={setSize} />
          <Field label="Image URL" value={imageUrl} onChangeText={setImageUrl} />
          <Field label="Roast Level" value={roastLevel} onChangeText={setRoastLevel} />
          <Field label="Origin" value={origin} onChangeText={setOrigin} />

          <Pressable style={styles.activeToggle} onPress={() => setActive((current) => !current)}>
            <View>
              <Text style={styles.activeLabel}>Active</Text>
              <Text style={styles.activeHelp}>Active products appear in the customer menu.</Text>
            </View>
            <View style={[styles.activeBadge, !active ? styles.inactiveBadge : null]}>
              <Text style={[styles.activeBadgeText, !active ? styles.inactiveBadgeText : null]}>
                {active ? "Yes" : "No"}
              </Text>
            </View>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={!canSave}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            !canSave ? styles.saveButtonDisabled : null,
            pressed ? styles.saveButtonPressed : null,
          ]}
        >
          {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Save Product</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
  multiline?: boolean;
}

function Field({ label, value, onChangeText, keyboardType = "default", multiline = false }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#8b9b95"
        style={[styles.input, multiline ? styles.multilineInput : null]}
        value={value}
      />
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
    marginBottom: 18,
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
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
  },
  subheading: {
    color: "#52635d",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  field: {
    marginBottom: 13,
  },
  fieldLabel: {
    color: "#25332f",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#f8fbf7",
    borderColor: "#d8e3dc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#18211f",
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  activeToggle: {
    alignItems: "center",
    borderTopColor: "#d8e3dc",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingTop: 15,
  },
  activeLabel: {
    color: "#25332f",
    fontSize: 15,
    fontWeight: "900",
  },
  activeHelp: {
    color: "#687b73",
    fontSize: 13,
    marginTop: 3,
  },
  activeBadge: {
    backgroundColor: "#e7f4ef",
    borderColor: "#9fcfbd",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inactiveBadge: {
    backgroundColor: "#fff7f5",
    borderColor: "#f0b8ad",
  },
  activeBadgeText: {
    color: "#0f766e",
    fontSize: 14,
    fontWeight: "900",
  },
  inactiveBadgeText: {
    color: "#9f3528",
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
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 18,
    paddingVertical: 15,
  },
  saveButtonDisabled: {
    backgroundColor: "#9aa9a3",
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
});
