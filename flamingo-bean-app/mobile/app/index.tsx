import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { ProductsScreen } from "../screens/ProductsScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoot() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: "#f4f7f2" },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f4f7f2" },
          headerTintColor: "#0f766e",
          headerTitleStyle: {
            color: "#18211f",
            fontWeight: "800",
          },
        }}
      >
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: "Flamingo Bean" }} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={({ route }) => ({ title: route.params.product.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
