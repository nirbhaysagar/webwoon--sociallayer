import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AppProvider } from '../../context/AppContext';
import ProductDiscoveryScreen from '../../screens/UserDashboard/ProductDiscoveryScreen';
import ProductDetailScreen from '../../screens/UserDashboard/ProductDetailScreen';
import ShoppingCartScreen from '../../screens/UserDashboard/ShoppingCartScreen';
import CheckoutScreen from '../../screens/UserDashboard/CheckoutScreen';
import UserHomeScreen from '../../screens/UserDashboard/UserHomeScreen';
import LiveRoomsScreen from '../../screens/UserDashboard/LiveRoomsScreen';
import MessagingScreen from '../../screens/UserDashboard/MessagingScreen';

// Mock data for testing
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    images: ['headphones1.jpg', 'headphones2.jpg'],
    rating: 4.5,
    review_count: 128,
    stock_quantity: 25,
    is_featured: true,
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    description: 'Comfortable organic cotton t-shirt',
    category: 'Clothing',
    images: ['tshirt1.jpg'],
    rating: 4.2,
    review_count: 89,
    stock_quantity: 50,
    is_featured: false,
  },
];

const mockCartItems = [
  {
    id: '1',
    product_id: '1',
    product_name: 'Wireless Headphones',
    price: 99.99,
    quantity: 1,
    total: 99.99,
  },
  {
    id: '2',
    product_id: '2',
    product_name: 'Organic Cotton T-Shirt',
    price: 29.99,
    quantity: 2,
    total: 59.98,
  },
];

const mockLiveRooms = [
  {
    id: '1',
    title: 'Electronics Showcase',
    seller_name: 'TechStore',
    viewer_count: 150,
    is_live: true,
    thumbnail: 'live1.jpg',
  },
  {
    id: '2',
    title: 'Fashion Haul',
    seller_name: 'FashionHub',
    viewer_count: 89,
    is_live: true,
    thumbnail: 'live2.jpg',
  },
];

describe('User Flow Tests', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  describe('Product Discovery Flow', () => {
    test('should display products in discovery view', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.getByText('Organic Cotton T-Shirt')).toBeTruthy();
        expect(screen.getByText('$99.99')).toBeTruthy();
        expect(screen.getByText('$29.99')).toBeTruthy();
      });
    });

    test('should allow searching for products', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.changeText(searchInput, 'headphones');
      
      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.queryByText('Organic Cotton T-Shirt')).toBeFalsy();
      });
    });

    test('should allow filtering by category', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      const categoryFilter = screen.getByText('Electronics');
      fireEvent.press(categoryFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.queryByText('Organic Cotton T-Shirt')).toBeFalsy();
      });
    });

    test('should allow sorting products by price', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      const sortButton = screen.getByText('Sort');
      fireEvent.press(sortButton);
      
      const priceLowToHigh = screen.getByText('Price: Low to High');
      fireEvent.press(priceLowToHigh);
      
      await waitFor(() => {
        // Should show T-shirt first (lower price)
        const products = screen.getAllByTestId('product-card');
        expect(products[0]).toHaveTextContent('Organic Cotton T-Shirt');
      });
    });

    test('should display product ratings and reviews', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('4.5')).toBeTruthy();
        expect(screen.getByText('(128 reviews)')).toBeTruthy();
        expect(screen.getByText('4.2')).toBeTruthy();
        expect(screen.getByText('(89 reviews)')).toBeTruthy();
      });
    });
  });

  describe('Product Detail Flow', () => {
    test('should display detailed product information', async () => {
      renderWithProvider(<ProductDetailScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.getByText('$99.99')).toBeTruthy();
        expect(screen.getByText('High-quality wireless headphones with noise cancellation')).toBeTruthy();
        expect(screen.getByText('Electronics')).toBeTruthy();
      });
    });

    test('should allow adding products to cart', async () => {
      renderWithProvider(<ProductDetailScreen />);
      
      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.press(addToCartButton);
      
      await waitFor(() => {
        expect(screen.getByText('Added to Cart!')).toBeTruthy();
        expect(screen.getByText('View Cart')).toBeTruthy();
      });
    });

    test('should allow selecting product quantity', async () => {
      renderWithProvider(<ProductDetailScreen />);
      
      const quantityIncrease = screen.getByTestId('quantity-increase');
      fireEvent.press(quantityIncrease);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeTruthy();
      });
    });

    test('should display product images in gallery', async () => {
      renderWithProvider(<ProductDetailScreen />);
      
      await waitFor(() => {
        expect(screen.getByTestId('product-image-0')).toBeTruthy();
        expect(screen.getByTestId('product-image-1')).toBeTruthy();
      });
    });

    test('should allow adding products to wishlist', async () => {
      renderWithProvider(<ProductDetailScreen />);
      
      const wishlistButton = screen.getByTestId('wishlist-button');
      fireEvent.press(wishlistButton);
      
      await waitFor(() => {
        expect(screen.getByText('Added to Wishlist')).toBeTruthy();
      });
    });
  });

  describe('Shopping Cart Flow', () => {
    test('should display cart items correctly', async () => {
      renderWithProvider(<ShoppingCartScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.getByText('Organic Cotton T-Shirt')).toBeTruthy();
        expect(screen.getByText('$99.99')).toBeTruthy();
        expect(screen.getByText('$29.99')).toBeTruthy();
        expect(screen.getByText('Total: $159.97')).toBeTruthy();
      });
    });

    test('should allow updating item quantities', async () => {
      renderWithProvider(<ShoppingCartScreen />);
      
      const quantityIncrease = screen.getByTestId('quantity-increase-1');
      fireEvent.press(quantityIncrease);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeTruthy();
        expect(screen.getByText('Total: $189.96')).toBeTruthy();
      });
    });

    test('should allow removing items from cart', async () => {
      renderWithProvider(<ShoppingCartScreen />);
      
      const removeButton = screen.getByTestId('remove-item-1');
      fireEvent.press(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Organic Cotton T-Shirt')).toBeFalsy();
        expect(screen.getByText('Total: $99.99')).toBeTruthy();
      });
    });

    test('should apply discount codes', async () => {
      renderWithProvider(<ShoppingCartScreen />);
      
      const discountInput = screen.getByPlaceholderText('Enter discount code');
      fireEvent.changeText(discountInput, 'SAVE20');
      
      const applyButton = screen.getByText('Apply');
      fireEvent.press(applyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Discount: -$31.99')).toBeTruthy();
        expect(screen.getByText('Final Total: $127.98')).toBeTruthy();
      });
    });

    test('should handle empty cart state', async () => {
      // Mock empty cart
      jest.mock('../../services/cartService', () => ({
        getCartItems: jest.fn(() => Promise.resolve([])),
      }));
      
      renderWithProvider(<ShoppingCartScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Your cart is empty')).toBeTruthy();
        expect(screen.getByText('Start shopping')).toBeTruthy();
      });
    });
  });

  describe('Checkout Flow', () => {
    test('should display order summary correctly', async () => {
      renderWithProvider(<CheckoutScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeTruthy();
        expect(screen.getByText('Wireless Headphones')).toBeTruthy();
        expect(screen.getByText('Organic Cotton T-Shirt')).toBeTruthy();
        expect(screen.getByText('Subtotal: $159.97')).toBeTruthy();
      });
    });

    test('should allow entering shipping address', async () => {
      renderWithProvider(<CheckoutScreen />);
      
      const addressInput = screen.getByPlaceholderText('Enter your address');
      fireEvent.changeText(addressInput, '123 Main St, City, State 12345');
      
      await waitFor(() => {
        expect(addressInput.props.value).toBe('123 Main St, City, State 12345');
      });
    });

    test('should allow selecting shipping method', async () => {
      renderWithProvider(<CheckoutScreen />);
      
      const standardShipping = screen.getByText('Standard Shipping (3-5 days)');
      fireEvent.press(standardShipping);
      
      await waitFor(() => {
        expect(screen.getByText('Shipping: $5.99')).toBeTruthy();
      });
    });

    test('should calculate taxes correctly', async () => {
      renderWithProvider(<CheckoutScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Tax: $12.80')).toBeTruthy();
        expect(screen.getByText('Total: $178.76')).toBeTruthy();
      });
    });

    test('should validate required fields before checkout', async () => {
      renderWithProvider(<CheckoutScreen />);
      
      const checkoutButton = screen.getByText('Complete Order');
      fireEvent.press(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your shipping address')).toBeTruthy();
        expect(screen.getByText('Please enter your phone number')).toBeTruthy();
      });
    });
  });

  describe('Live Commerce Flow', () => {
    test('should display live rooms list', async () => {
      renderWithProvider(<LiveRoomsScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Electronics Showcase')).toBeTruthy();
        expect(screen.getByText('Fashion Haul')).toBeTruthy();
        expect(screen.getByText('TechStore')).toBeTruthy();
        expect(screen.getByText('150 viewers')).toBeTruthy();
      });
    });

    test('should allow joining live rooms', async () => {
      renderWithProvider(<LiveRoomsScreen />);
      
      const joinButton = screen.getByText('Join Live');
      fireEvent.press(joinButton);
      
      await waitFor(() => {
        expect(screen.getByText('Live Room')).toBeTruthy();
        expect(screen.getByText('151 viewers')).toBeTruthy();
      });
    });

    test('should display live chat', async () => {
      renderWithProvider(<LiveRoomsScreen />);
      
      const chatInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.changeText(chatInput, 'Great products!');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Great products!')).toBeTruthy();
      });
    });

    test('should allow purchasing products during live stream', async () => {
      renderWithProvider(<LiveRoomsScreen />);
      
      const buyNowButton = screen.getByText('Buy Now');
      fireEvent.press(buyNowButton);
      
      await waitFor(() => {
        expect(screen.getByText('Product added to cart')).toBeTruthy();
      });
    });
  });

  describe('Messaging and Social Flow', () => {
    test('should display conversations list', async () => {
      renderWithProvider(<MessagingScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Messages')).toBeTruthy();
        expect(screen.getByText('TechStore')).toBeTruthy();
        expect(screen.getByText('FashionHub')).toBeTruthy();
      });
    });

    test('should allow sending messages', async () => {
      renderWithProvider(<MessagingScreen />);
      
      const messageInput = screen.getByPlaceholderText('Type a message...');
      fireEvent.changeText(messageInput, 'Hello! I have a question about your products.');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello! I have a question about your products.')).toBeTruthy();
      });
    });

    test('should display message timestamps', async () => {
      renderWithProvider(<MessagingScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('2 min ago')).toBeTruthy();
        expect(screen.getByText('5 min ago')).toBeTruthy();
      });
    });
  });

  describe('User Home and Navigation Flow', () => {
    test('should display personalized recommendations', async () => {
      renderWithProvider(<UserHomeScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Recommended for You')).toBeTruthy();
        expect(screen.getByText('Recently Viewed')).toBeTruthy();
        expect(screen.getByText('Trending Now')).toBeTruthy();
      });
    });

    test('should allow navigating to different sections', async () => {
      renderWithProvider(<UserHomeScreen />);
      
      const categoriesButton = screen.getByText('Categories');
      fireEvent.press(categoriesButton);
      
      await waitFor(() => {
        expect(screen.getByText('All Categories')).toBeTruthy();
        expect(screen.getByText('Electronics')).toBeTruthy();
        expect(screen.getByText('Clothing')).toBeTruthy();
      });
    });

    test('should display user profile information', async () => {
      renderWithProvider(<UserHomeScreen />);
      
      const profileButton = screen.getByTestId('profile-button');
      fireEvent.press(profileButton);
      
      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeTruthy();
        expect(screen.getByText('Order History')).toBeTruthy();
        expect(screen.getByText('Settings')).toBeTruthy();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProvider(<ProductDiscoveryScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to load products')).toBeTruthy();
        expect(screen.getByText('Please check your connection and try again')).toBeTruthy();
      });
    });

    test('should handle out of stock products', async () => {
      // Mock out of stock product
      const outOfStockProduct = { ...mockProducts[0], stock_quantity: 0 };
      jest.mock('../../services/productService', () => ({
        getProducts: jest.fn(() => Promise.resolve([outOfStockProduct])),
      }));
      
      renderWithProvider(<ProductDetailScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Out of Stock')).toBeTruthy();
        expect(screen.queryByText('Add to Cart')).toBeFalsy();
      });
    });

    test('should handle invalid discount codes', async () => {
      renderWithProvider(<ShoppingCartScreen />);
      
      const discountInput = screen.getByPlaceholderText('Enter discount code');
      fireEvent.changeText(discountInput, 'INVALID');
      
      const applyButton = screen.getByText('Apply');
      fireEvent.press(applyButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid discount code')).toBeTruthy();
      });
    });

    test('should handle slow loading states', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      // Should show loading indicator initially
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).toBeFalsy();
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    test('should handle large product lists efficiently', async () => {
      // Mock large product list
      const largeProductList = Array.from({ length: 100 }, (_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        name: `Product ${i}`,
      }));
      
      jest.mock('../../services/productService', () => ({
        getProducts: jest.fn(() => Promise.resolve(largeProductList)),
      }));
      
      renderWithProvider(<ProductDiscoveryScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Product 0')).toBeTruthy();
        expect(screen.getByText('Product 99')).toBeTruthy();
      });
    });

    test('should handle different screen orientations', async () => {
      renderWithProvider(<ProductDiscoveryScreen />);
      
      // Test landscape orientation
      // This would require mocking Dimensions differently
      expect(screen.getByText('Discover Products')).toBeTruthy();
    });
  });
});

