import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartService, CartItem, WishlistItem } from '../services/cartService';
import { getCurrentUser } from '../services/supabase';

export interface ShopItem {
  id: string;
  title?: string;
  name?: string;
  price: number;
  image?: string;
  image_url?: string;
  store?: string;
  quantity: number;
}

interface UserShopContextType {
  cart: ShopItem[];
  wishlist: ShopItem[];
  loading: boolean;
  addToCart: (item: ShopItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  addToWishlist: (item: ShopItem) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  moveToCart: (item: ShopItem) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const UserShopContext = createContext<UserShopContextType | undefined>(undefined);

export const useUserShop = () => {
  const context = useContext(UserShopContext);
  if (!context) {
    throw new Error('useUserShop must be used within a UserShopProvider');
  }
  return context;
};

export const UserShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ShopItem[]>([]);
  const [wishlist, setWishlist] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert database items to ShopItem format
  const convertCartItemToShopItem = (cartItem: CartItem): ShopItem => ({
    id: cartItem.id,
    title: cartItem.product?.name || 'Unknown Product',
    price: cartItem.product?.price || 0,
    image: cartItem.product?.image_url || '',
    store: cartItem.product?.store?.name || 'Unknown Store',
    quantity: cartItem.quantity
  });

  const convertWishlistItemToShopItem = (wishlistItem: WishlistItem): ShopItem => ({
    id: wishlistItem.id,
    title: wishlistItem.product?.name || 'Unknown Product',
    price: wishlistItem.product?.price || 0,
    image: wishlistItem.product?.image_url || '',
    store: wishlistItem.product?.store?.name || 'Unknown Store',
    quantity: 1
  });

  // Load cart and wishlist on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        await Promise.all([
          refreshCart(),
          refreshWishlist()
        ]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const cartItems = await CartService.getUserCart(user.id);
      const shopItems = cartItems.map(convertCartItemToShopItem);
      setCart(shopItems);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  const refreshWishlist = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const wishlistItems = await CartService.getUserWishlist(user.id);
      const shopItems = wishlistItems.map(convertWishlistItemToShopItem);
      setWishlist(shopItems);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    }
  };

  const addToCart = async (item: ShopItem) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      // Find the product ID from the item
      // For now, we'll use a mock product ID - in real app, this would come from the product data
      const productId = parseInt(item.id) || 1; // Fallback to 1 for testing

      const cartItem = await CartService.addToCart(user.id, productId, item.quantity);
      if (cartItem) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const success = await CartService.removeFromCart(itemId);
      if (success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    try {
      const cartItem = await CartService.updateCartItemQuantity(itemId, quantity);
      if (cartItem) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const addToWishlist = async (item: ShopItem) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const productId = parseInt(item.id) || 1; // Fallback to 1 for testing

      const wishlistItem = await CartService.addToWishlist(user.id, productId);
      if (wishlistItem) {
        await refreshWishlist();
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const success = await CartService.removeFromWishlist(itemId);
      if (success) {
        await refreshWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveToCart = async (item: ShopItem) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const success = await CartService.moveToCart(user.id, item.id);
      if (success) {
        await Promise.all([refreshCart(), refreshWishlist()]);
      }
    } catch (error) {
      console.error('Error moving item to cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const success = await CartService.clearCart(user.id);
      if (success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const value: UserShopContextType = {
    cart,
    wishlist,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearCart,
    refreshCart,
    refreshWishlist
  };

  return (
    <UserShopContext.Provider value={value}>
      {children}
    </UserShopContext.Provider>
  );
}; 