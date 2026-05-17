import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartHeaderButton } from "../components/CartHeaderButton";
import { AdminAuthProvider } from "../contexts/AdminAuthContext";
import { CartProvider } from "../contexts/CartContext";
import { AdminOrderDetailScreen } from "../screens/AdminOrderDetailScreen";
import { AdminOrdersScreen } from "../screens/AdminOrdersScreen";
import { AdminProductFormScreen } from "../screens/AdminProductFormScreen";
import { AdminProductsScreen } from "../screens/AdminProductsScreen";
import { CartScreen } from "../screens/CartScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";
import { PaymentPendingScreen } from "../screens/PaymentPendingScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { ProductsScreen } from "../screens/ProductsScreen";
import { theme } from "../theme";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoot() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={({ navigation }) => ({
              contentStyle: { backgroundColor: theme.colors.background },
              headerRight: () => <CartHeaderButton onPress={() => navigation.navigate("Cart")} />,
              headerShadowVisible: false,
              headerStyle: { backgroundColor: theme.colors.background },
              headerTintColor: theme.colors.sage,
              headerTitleStyle: {
                color: theme.colors.text,
                fontWeight: "800",
              },
            })}
          >
            <Stack.Screen name="Products" component={ProductsScreen} options={{ title: "Flamingo Bean" }} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={({ route }) => ({ title: route.params.product.name })}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                headerRight: undefined,
                title: "Cart",
              }}
            />
            <Stack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
              options={{
                headerRight: undefined,
                title: "Order Confirmed",
              }}
            />
            <Stack.Screen
              name="PaymentPending"
              component={PaymentPendingScreen}
              options={{
                headerRight: undefined,
                title: "Payment Pending",
              }}
            />
            <Stack.Screen
              name="AdminOrders"
              component={AdminOrdersScreen}
              options={{
                headerRight: undefined,
                title: "Admin Orders",
              }}
            />
            <Stack.Screen
              name="AdminOrderDetail"
              component={AdminOrderDetailScreen}
              options={({ route }) => ({
                headerRight: undefined,
                title: route.params.orderId,
              })}
            />
            <Stack.Screen
              name="AdminProducts"
              component={AdminProductsScreen}
              options={{
                headerRight: undefined,
                title: "Admin Products",
              }}
            />
            <Stack.Screen
              name="AdminProductForm"
              component={AdminProductFormScreen}
              options={({ route }) => ({
                headerRight: undefined,
                title: route.params?.product ? "Edit Product" : "Add Product",
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AdminAuthProvider>
  );
}
