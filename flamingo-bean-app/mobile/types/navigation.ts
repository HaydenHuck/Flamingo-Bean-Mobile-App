import type { Product } from "./product";

export type RootStackParamList = {
  Products: undefined;
  ProductDetail: {
    product: Product;
  };
};

