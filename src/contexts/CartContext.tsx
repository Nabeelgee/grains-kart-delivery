import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  restaurant_id: string;
  restaurant_name: string;
  is_veg: boolean;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("grainskart_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(() => {
    const saved = localStorage.getItem("grainskart_cart_restaurant");
    return saved || null;
  });

  const [restaurantName, setRestaurantName] = useState<string | null>(() => {
    const saved = localStorage.getItem("grainskart_cart_restaurant_name");
    return saved || null;
  });

  useEffect(() => {
    localStorage.setItem("grainskart_cart", JSON.stringify(items));
    if (items.length > 0) {
      localStorage.setItem("grainskart_cart_restaurant", items[0].restaurant_id);
      localStorage.setItem("grainskart_cart_restaurant_name", items[0].restaurant_name);
    } else {
      localStorage.removeItem("grainskart_cart_restaurant");
      localStorage.removeItem("grainskart_cart_restaurant_name");
      setRestaurantId(null);
      setRestaurantName(null);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    // Check if adding from different restaurant
    if (restaurantId && restaurantId !== item.restaurant_id) {
      if (!window.confirm("Adding items from a different restaurant will clear your current cart. Continue?")) {
        return;
      }
      setItems([{ ...item, quantity: 1 }]);
      setRestaurantId(item.restaurant_id);
      setRestaurantName(item.restaurant_name);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    if (!restaurantId) {
      setRestaurantId(item.restaurant_id);
      setRestaurantName(item.restaurant_name);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = itemCount > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        total,
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
