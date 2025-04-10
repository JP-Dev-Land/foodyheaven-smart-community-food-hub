import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { FoodItem } from '../types/api';
import { CartItem, CartState, CartContextType } from '../types/cart';

const CART_STORAGE_KEY = 'foodyheaven_cart';

// Helper to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error("Failed to load cart from storage:", error);
        return [];
    }
};

// Helper to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save cart to storage:", error);
    }
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

    // Save to localStorage whenever items change
    useEffect(() => {
        saveCartToStorage(items);
    }, [items]);

    const addItem = useCallback((itemToAdd: FoodItem, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === itemToAdd.id);
            if (existingItemIndex > -1) {
                // Update quantity if item already exists
                const updatedItems = [...prevItems];
                const existingItem = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity
                };
                return updatedItems;
            } else {
                // Add new item
                return [...prevItems, { ...itemToAdd, quantity }];
            }
        });
    }, []);

    const removeItem = useCallback((itemId: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }, []);

    const updateItemQuantity = useCallback((itemId: number, newQuantity: number) => {
        setItems(prevItems => {
            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                return prevItems.filter(item => item.id !== itemId);
            }
            // Update quantity otherwise
            return prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getItemQuantity = useCallback((itemId: number): number => {
        const item = items.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    }, [items]);

    // Calculate derived state (itemCount, totalAmount) using useMemo for performance
    const cartState = useMemo((): CartState => {
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0);
        return { items, itemCount, totalAmount };
    }, [items]);

    const contextValue: CartContextType = {
        ...cartState,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        getItemQuantity,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};