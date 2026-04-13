"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  iconUrl?: string | null;
  quantity: number;
  duration: number;
  durationLabel: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, duration?: number, durationLabel?: string) => void;
  removeFromCart: (productId: string, duration?: number) => void;
  updateQuantity: (productId: string, quantity: number, duration?: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
  appliedCoupon: any | null;
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("lux-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("lux-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, duration: number = 1, durationLabel: string = "1 tháng") => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.duration === duration
      );
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.duration === duration
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          brand: product.brand,
          iconUrl: product.icon_url || product.iconUrl,
          quantity: 1,
          duration,
          durationLabel,
        },
      ];
    });
  };

  const removeFromCart = (productId: string, duration?: number) => {
    setCart((prev) => 
      prev.filter((item) => {
        if (duration !== undefined) {
          return !(item.id === productId && item.duration === duration);
        }
        return item.id !== productId;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, duration?: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => {
        const matchesId = item.id === productId;
        const matchesDuration = duration === undefined || item.duration === duration;
        
        if (matchesId && matchesDuration) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: any) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discountAmount = (totalPrice * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const finalPrice = Math.max(0, totalPrice - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        appliedCoupon,
        totalItems,
        totalPrice,
        discountAmount,
        finalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
