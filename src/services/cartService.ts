import { supabase } from './supabase';
import { getCurrentUser } from './supabase';

export interface CartItem {
  id: string;
  product_id: number;
  user_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    store_id: number;
    store?: {
      name: string;
    };
  };
}

export interface WishlistItem {
  id: string;
  product_id: number;
  user_id: string;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    store_id: number;
    store?: {
      name: string;
    };
  };
}

export class CartService {
  // Get user's cart items with product details
  static async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            id,
            name,
            price,
            image_url,
            store_id,
            store:stores(name)
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('CartService.getUserCart error:', error);
      return [];
    }
  }

  // Get user's wishlist items with product details
  static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(`
          *,
          product:products(
            id,
            name,
            price,
            image_url,
            store_id,
            store:stores(name)
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('CartService.getUserWishlist error:', error);
      return [];
    }
  }

  // Add item to cart
  static async addToCart(userId: string, productId: number, quantity: number = 1): Promise<CartItem | null> {
    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity if item exists
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Add new item to cart
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('CartService.addToCart error:', error);
      return null;
    }
  }

  // Update cart item quantity
  static async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem | null> {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return await this.removeFromCart(cartItemId);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('CartService.updateCartItemQuantity error:', error);
      return null;
    }
  }

  // Remove item from cart
  static async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('CartService.removeFromCart error:', error);
      return false;
    }
  }

  // Add item to wishlist
  static async addToWishlist(userId: string, productId: number): Promise<WishlistItem | null> {
    try {
      // Check if item already exists in wishlist
      const { data: existingItem } = await supabase
        .from('waitlist')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Item already exists in wishlist
        return existingItem;
      }

      // Add new item to wishlist
      const { data, error } = await supabase
        .from('waitlist')
        .insert({
          user_id: userId,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('CartService.addToWishlist error:', error);
      return null;
    }
  }

  // Remove item from wishlist
  static async removeFromWishlist(wishlistItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('CartService.removeFromWishlist error:', error);
      return false;
    }
  }

  // Move item from wishlist to cart
  static async moveToCart(userId: string, wishlistItemId: string): Promise<boolean> {
    try {
      // Get wishlist item details
      const { data: wishlistItem } = await supabase
        .from('waitlist')
        .select('*')
        .eq('id', wishlistItemId)
        .single();

      if (!wishlistItem) {
        throw new Error('Wishlist item not found');
      }

      // Add to cart
      const cartItem = await this.addToCart(userId, wishlistItem.product_id, 1);
      if (!cartItem) {
        throw new Error('Failed to add item to cart');
      }

      // Remove from wishlist
      const removed = await this.removeFromWishlist(wishlistItemId);
      if (!removed) {
        throw new Error('Failed to remove item from wishlist');
      }

      return true;
    } catch (error) {
      console.error('CartService.moveToCart error:', error);
      return false;
    }
  }

  // Clear user's cart
  static async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('CartService.clearCart error:', error);
      return false;
    }
  }

  // Get cart total
  static async getCartTotal(userId: string): Promise<number> {
    try {
      const cartItems = await this.getUserCart(userId);
      return cartItems.reduce((total, item) => {
        return total + (item.product?.price || 0) * item.quantity;
      }, 0);
    } catch (error) {
      console.error('CartService.getCartTotal error:', error);
      return 0;
    }
  }

  // Get cart item count
  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const cartItems = await this.getUserCart(userId);
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('CartService.getCartItemCount error:', error);
      return 0;
    }
  }
} 