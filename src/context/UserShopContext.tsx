import React, { createContext, useState } from 'react';

// Define the item type
interface ShopItem {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  quantity?: number;
  [key: string]: any; // Allow additional properties
}

// Define the context type
interface UserShopContextType {
  wishlist: ShopItem[];
  cart: ShopItem[];
  addToWishlist: (item: ShopItem) => void;
  addToCart: (item: ShopItem) => void;
  removeFromWishlist: (id: string) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearWishlist: () => void;
}

export const UserShopContext = createContext<UserShopContextType>({
  wishlist: [],
  cart: [],
  addToWishlist: () => {},
  addToCart: () => {},
  removeFromWishlist: () => {},
  removeFromCart: () => {},
  updateCartItemQuantity: () => {},
  clearCart: () => {},
  clearWishlist: () => {},
});

export const UserShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<ShopItem[]>([]);
  const [cart, setCart] = useState<ShopItem[]>([]);

  const addToWishlist = (item: ShopItem) => {
    setWishlist((prev) => prev.find((w) => w.id === item.id) ? prev : [...prev, item]);
  };

  const addToCart = (item: ShopItem) => {
    setCart((prev) => {
      const existingItem = prev.find((c) => c.id === item.id);
      if (existingItem) {
        return prev.map((c) => 
          c.id === item.id 
            ? { ...c, quantity: (c.quantity || 1) + 1 }
            : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    setCart((prev) => 
      prev.map((item) => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <UserShopContext.Provider
      value={{ 
        wishlist, 
        cart, 
        addToWishlist, 
        addToCart, 
        removeFromWishlist, 
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        clearWishlist
      }}
    >
      {children}
    </UserShopContext.Provider>
  );
}; 