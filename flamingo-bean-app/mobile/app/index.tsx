import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartHeaderButton } from "../components/CartHeaderButton";
import { CartProvider } from "../contexts/CartContext";
import { CartScreen } from "../screens/CartScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { ProductsScreen } from "../screens/ProductsScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoot() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            contentStyle: { backgroundColor: "#f4f7f2" },
            headerRight: () => <CartHeaderButton onPress={() => navigation.navigate("Cart")} />,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: "#f4f7f2" },
            headerTintColor: "#0f766e",
            headerTitleStyle: {
              color: "#18211f",
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
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
