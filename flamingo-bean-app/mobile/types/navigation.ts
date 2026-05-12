import type { Product } from "./product";
import type { OrderConfirmation } from "./order";

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: {
    product: Product;
  };
  Cart: undefined;
  OrderConfirmation: {
    order: OrderConfirmation;
  };
  AdminOrders: undefined;
  AdminOrderDetail: {
    orderId: string;
  };
};
