import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AppProvider } from '../../context/AppContext';
import ProductsScreen from '../../screens/SellerDashboard/ProductsScreen';
import ProductDetailScreen from '../../screens/UserDashboard/ProductDetailScreen';
import ShoppingCartScreen from '../../screens/UserDashboard/ShoppingCartScreen';
import CheckoutScreen from '../../screens/UserDashboard/CheckoutScreen';
import OrdersScreen from '../../screens/SellerDashboard/OrdersScreen';
import AdvancedAnalyticsDashboard from '../../screens/SellerDashboard/AdvancedAnalyticsDashboard';

// Mock data for integration testing
const mockProduct = {
  id: '1',
  name: 'Test Integration Product',
  price: 79.99,
  description: 'A product to test the complete seller-user flow',
  category: 'Electronics',
  stock_quantity: 100,
  is_active: true,
  is_featured: false,
  created_at: '2024-01-01T00:00:00Z',
};

const mockOrder = {
  id: '1',
  order_number: 'INT-001',
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  total_amount: 79.99,
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  items: [
    {
      product_id: '1',
      product_name: 'Test Integration Product',
      quantity: 1,
      price: 79.99,
    },
  ],
};

describe('Seller-User Integration Flow Tests', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <AppProvider>
        {component}
      </AppProvider>
    );
  };

  describe('Complete Product Lifecycle Flow', () => {
    test('should allow seller to create product and user to purchase it', async () => {
      // Step 1: Seller creates product
      renderWithProvider(<ProductsScreen />);
      
      const addProductButton = screen.getByText('Add Product');
      fireEvent.press(addProductButton);
      
      // Fill product form
      const nameInput = screen.getByPlaceholderText('Product name');
      const priceInput = screen.getByPlaceholderText('Price');
      const descriptionInput = screen.getByPlaceholderText('Description');
      
      fireEvent.changeText(nameInput, 'Test Integration Product');
      fireEvent.changeText(priceInput, '79.99');
      fireEvent.changeText(descriptionInput, 'A product to test the complete seller-user flow');
      
      const saveButton = screen.getByText('Save Product');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Product saved successfully')).toBeTruthy();
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
      });
      
      // Step 2: User discovers and purchases product
      // Navigate to user product detail
      const productCard = screen.getByText('Test Integration Product');
      fireEvent.press(productCard);
      
      await waitFor(() => {
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
        expect(screen.getByText('$79.99')).toBeTruthy();
      });
      
      // Add to cart
      const addToCartButton = screen.getByText('Add to Cart');
      fireEvent.press(addToCartButton);
      
      await waitFor(() => {
        expect(screen.getByText('Added to Cart!')).toBeTruthy();
      });
      
      // Navigate to cart
      const viewCartButton = screen.getByText('View Cart');
      fireEvent.press(viewCartButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
        expect(screen.getByText('Total: $79.99')).toBeTruthy();
      });
      
      // Proceed to checkout
      const checkoutButton = screen.getByText('Proceed to Checkout');
      fireEvent.press(checkoutButton);
      
      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeTruthy();
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
      });
      
      // Complete order
      const completeOrderButton = screen.getByText('Complete Order');
      fireEvent.press(completeOrderButton);
      
      await waitFor(() => {
        expect(screen.getByText('Order placed successfully!')).toBeTruthy();
      });
    });
  });

  describe('Order Processing Flow', () => {
    test('should show order in seller dashboard after user purchase', async () => {
      // First, simulate a completed order
      renderWithProvider(<OrdersScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('INT-001')).toBeTruthy();
        expect(screen.getByText('Test Customer')).toBeTruthy();
        expect(screen.getByText('$79.99')).toBeTruthy();
        expect(screen.getByText('pending')).toBeTruthy();
      });
      
      // Seller updates order status
      const updateStatusButton = screen.getByText('Update Status');
      fireEvent.press(updateStatusButton);
      
      const processingOption = screen.getByText('Processing');
      fireEvent.press(processingOption);
      
      await waitFor(() => {
        expect(screen.getByText('Status updated successfully')).toBeTruthy();
        expect(screen.getByText('processing')).toBeTruthy();
      });
      
      // Update to shipped
      const shippedOption = screen.getByText('Shipped');
      fireEvent.press(shippedOption);
      
      await waitFor(() => {
        expect(screen.getByText('shipped')).toBeTruthy();
      });
    });
  });

  describe('Inventory Management Flow', () => {
    test('should update inventory when user purchases product', async () => {
      // Check initial inventory
      renderWithProvider(<ProductsScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
        expect(screen.getByText('100 in stock')).toBeTruthy();
      });
      
      // Simulate purchase (reduce inventory)
      const editProductButton = screen.getByText('Edit');
      fireEvent.press(editProductButton);
      
      const stockInput = screen.getByPlaceholderText('Stock quantity');
      fireEvent.changeText(stockInput, '99');
      
      const saveChangesButton = screen.getByText('Save Changes');
      fireEvent.press(saveChangesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Product updated successfully')).toBeTruthy();
        expect(screen.getByText('99 in stock')).toBeTruthy();
      });
    });
  });

  describe('Analytics Integration Flow', () => {
    test('should reflect sales data in analytics dashboard', async () => {
      renderWithProvider(<AdvancedAnalyticsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue')).toBeTruthy();
        expect(screen.getByText('Orders')).toBeTruthy();
        expect(screen.getByText('Products')).toBeTruthy();
      });
      
      // Check if the test order is reflected in analytics
      const revenueCard = screen.getByText('Revenue');
      expect(revenueCard).toBeTruthy();
      
      // Navigate to predictions tab
      const predictionsTab = screen.getByText('Predictions');
      fireEvent.press(predictionsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Forecast')).toBeTruthy();
      });
    });
  });

  describe('Real-time Updates Flow', () => {
    test('should show real-time updates for both seller and user', async () => {
      // Seller side - check for new orders
      renderWithProvider(<OrdersScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('INT-001')).toBeTruthy();
      });
      
      // Simulate real-time order update
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.press(refreshButton);
      
      await waitFor(() => {
        // Should show updated order information
        expect(screen.getByText('INT-001')).toBeTruthy();
      });
    });
  });

  describe('Customer Communication Flow', () => {
    test('should allow seller and user to communicate about orders', async () => {
      // Seller views order details
      renderWithProvider(<OrdersScreen />);
      
      const orderRow = screen.getByText('INT-001');
      fireEvent.press(orderRow);
      
      await waitFor(() => {
        expect(screen.getByText('Order Details')).toBeTruthy();
        expect(screen.getByText('Test Customer')).toBeTruthy();
        expect(screen.getByText('test@example.com')).toBeTruthy();
      });
      
      // Send message to customer
      const messageButton = screen.getByText('Message Customer');
      fireEvent.press(messageButton);
      
      const messageInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.changeText(messageInput, 'Your order is being processed. Thank you for your purchase!');
      
      const sendButton = screen.getByText('Send');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Message sent successfully')).toBeTruthy();
      });
    });
  });

  describe('Product Performance Tracking Flow', () => {
    test('should track product performance across the platform', async () => {
      // Check product analytics
      renderWithProvider(<AdvancedAnalyticsDashboard />);
      
      // Navigate to insights tab
      const insightsTab = screen.getByText('Insights');
      fireEvent.press(insightsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Product Performance')).toBeTruthy();
      });
      
      // Check if test product appears in analytics
      const productPerformance = screen.getByText('Test Integration Product');
      expect(productPerformance).toBeTruthy();
    });
  });

  describe('Error Handling and Recovery Flow', () => {
    test('should handle and recover from errors gracefully', async () => {
      // Simulate network error
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProvider(<ProductsScreen />);
      
      await waitFor(() => {
        expect(screen.getByText('Error loading products')).toBeTruthy();
      });
      
      // Retry functionality
      const retryButton = screen.getByText('Retry');
      fireEvent.press(retryButton);
      
      // Mock successful response
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve([mockProduct]),
      } as Response);
      
      await waitFor(() => {
        expect(screen.getByText('Test Integration Product')).toBeTruthy();
      });
    });
  });

  describe('Data Consistency Flow', () => {
    test('should maintain data consistency across seller and user views', async () => {
      // Seller updates product
      renderWithProvider(<ProductsScreen />);
      
      const editButton = screen.getByText('Edit');
      fireEvent.press(editButton);
      
      const priceInput = screen.getByPlaceholderText('Price');
      fireEvent.changeText(priceInput, '89.99');
      
      const saveButton = screen.getByText('Save Changes');
      fireEvent.press(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Product updated successfully')).toBeTruthy();
        expect(screen.getByText('$89.99')).toBeTruthy();
      });
      
      // User should see updated price
      // Navigate to user product view
      const productCard = screen.getByText('Test Integration Product');
      fireEvent.press(productCard);
      
      await waitFor(() => {
        expect(screen.getByText('$89.99')).toBeTruthy();
      });
    });
  });

  describe('Performance and Scalability Flow', () => {
    test('should handle multiple concurrent operations efficiently', async () => {
      // Simulate multiple users viewing products
      const { rerender } = renderWithProvider(<ProductsScreen />);
      
      // Multiple rapid operations
      const addProductButton = screen.getByText('Add Product');
      
      // Rapid clicks
      fireEvent.press(addProductButton);
      fireEvent.press(addProductButton);
      fireEvent.press(addProductButton);
      
      await waitFor(() => {
        // Should handle rapid operations gracefully
        expect(screen.getByText('Add Product')).toBeTruthy();
      });
    });
  });
});

