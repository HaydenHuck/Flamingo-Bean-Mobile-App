import type { Product } from "./product";
import type { CheckoutSession, OrderConfirmation } from "./order";

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: {
    product: Product;
  };
  Cart: undefined;
  OrderConfirmation: {
    order: OrderConfirmation;
  };
  PaymentPending: {
    checkout: CheckoutSession;
  };
  AdminOrders: undefined;
  AdminOrderDetail: {
    orderId: string;
  };
  AdminProducts: undefined;
  AdminProductForm:
    | {
        product?: Product;
      }
    | undefined;
};
