import { FoodItem } from './api';

export interface CartItem extends FoodItem { // Extends FoodItem for easy access to details
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
}

export interface CartContextType extends CartState {
  addItem: (item: FoodItem, quantity?: number) => void;
  removeItem: (itemId: number) => void;
  updateItemQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: number) => number; // Helper
}