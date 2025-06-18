export interface CartItem {
  productId: string; // or farmProductId depending on your DB
  title: string;
  price: number;
  quantity: number;
  total: number;
}
