import { useState, useEffect, useCallback } from 'react';
import { ordersApi, queueApi } from '../utils/api';
import type { Order } from '../App';

export interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: {
    queueNumber: number;
    items: Order['items'];
    total: number;
    orderNotes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  removeOrder: (orderId: string) => Promise<void>;
  getNextQueueNumber: () => Promise<number>;
}

export function useOrders(autoRefresh = false, refreshInterval = 5000): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      setError(null);
      const fetchedOrdersResponse = await ordersApi.getAll();
      setOrders(fetchedOrdersResponse.orders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      console.error('Error fetching orders:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: {
    queueNumber: number;
    items: Order['items'];
    total: number;
    orderNotes?: string;
  }) => {
    try {
      setError(null);
      const createdResponse = await ordersApi.create(orderData);
      const newOrder = createdResponse.order;
      
      // Optimistically update local state
      setOrders(prev => [...prev, newOrder]);
      
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      console.error('Error creating order:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    try {
      setError(null);
      const updatedResponse = await ordersApi.updateStatus(orderId, status);
      const updatedOrder = updatedResponse.order;
      
      // Optimistically update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Error updating order status:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const removeOrder = useCallback(async (orderId: string) => {
    try {
      setError(null);
      await ordersApi.delete(orderId);
      
      // Optimistically update local state
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove order';
      console.error('Error removing order:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getNextQueueNumber = useCallback(async () => {
    try {
      setError(null);
      const response = await queueApi.getNextQueueNumber();
      return response.queueNumber;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get next queue number';
      console.error('Error getting next queue number:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Auto-refresh for kitchen display
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshOrders]);

  return {
    orders,
    loading,
    error,
    refreshOrders,
    createOrder,
    updateOrderStatus,
    removeOrder,
    getNextQueueNumber,
  };
}