import { useState, useEffect, useRef } from 'react';
import { OrderTaking } from './components/OrderTaking';
import { KitchenDisplay } from './components/KitchenDisplay';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { ChefHat, Smartphone, Wifi, WifiOff, PhoneCall } from 'lucide-react';
import { PhoneOrderTaking } from './components/PhoneOrderTaking';
import { ordersApi, healthApi } from './utils/api';
import { toast, Toaster } from 'sonner';
import { useDeviceOptimization } from './hooks/useDeviceOptimization';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  category: string;
  customizations: {
    sauces?: string[]; // Changed to array for multiple sauces
    chickenType?: string;
  };
}

export interface Order {
  id: string;
  queueNumber: number;
  items: OrderItem[];
  timestamp: Date;
  status: 'pending' | 'preparing' | 'ready';
  total: number;
  orderNotes?: string; // Added order-level notes
  userId?: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<'orders' | 'phone' | 'kitchen'>('orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  
  // Device optimization
  const { 
    isDynamicIsland, 
    isNotch, 
    isPunchHole, 
    isHomeIndicator,
    getDeviceSpacing 
  } = useDeviceOptimization();
  
  // Refs for device optimization
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load orders from backend
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders();
      const backendOrders = response.orders.map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp),
      }));
      setOrders(backendOrders);
      setError('');
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders: ' + err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Check backend connectivity
  const checkConnectivity = async () => {
    try {
      await healthApi.checkHealth();
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
      console.error('Backend connectivity check failed:', err);
    }
  };

  useEffect(() => {
    loadOrders();
    checkConnectivity();
    
    // Set up periodic refresh for kitchen display
    const interval = setInterval(() => {
      if (currentView === 'kitchen') {
        loadOrders();
      }
      checkConnectivity();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [currentView]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'timestamp' | 'userId'>) => {
    try {
      const response = await ordersApi.createOrder({
        ...orderData,
        items: orderData.items,
        total: orderData.total,
        queueNumber: orderData.queueNumber,
        orderNotes: orderData.orderNotes,
        userId: 'system', // Use a default user ID
      });
      
      const newOrder = {
        ...response.order,
        timestamp: new Date(response.order.timestamp),
      };
      
      setOrders(prev => [newOrder, ...prev]);
      toast.success(`Order #${newOrder.queueNumber} created successfully`);
      
      // Refresh orders to ensure consistency
      setTimeout(loadOrders, 1000);
    } catch (err: any) {
      console.error('Error creating order:', err);
      toast.error('Failed to create order: ' + err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await ordersApi.updateOrderStatus(orderId, status);
      const updatedOrder = {
        ...response.order,
        timestamp: new Date(response.order.timestamp),
      };
      
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      toast.success(`Order status updated to ${status}`);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status: ' + err.message);
    }
  };

  const removeOrder = async (orderId: string) => {
    try {
      await ordersApi.deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order completed and archived');
    } catch (err: any) {
      console.error('Error removing order:', err);
      toast.error('Failed to remove order: ' + err.message);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <div 
        ref={headerRef}
        className={`bg-card border-b px-3 py-2 sticky top-0 z-50 ${
          isDynamicIsland ? 'dynamic-island-header' :
          isNotch ? 'notch-header' :
          isPunchHole ? 'punch-hole-header' :
          'mobile-safe-area'
        }`}
      >
        <div className="flex items-center justify-between mobile-nav">
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              variant={currentView === 'orders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('orders')}
              className="w-full h-10 text-sm touch-target"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              <span className="mobile-text-base tablet-text-lg font-medium">Pedidos</span>
            </Button>
            <Button
              variant={currentView === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('phone')}
              className="w-full h-10 text-sm touch-target"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              <span className="mobile-text-base tablet-text-lg font-medium">Telefone</span>
            </Button>
            <Button
              variant={currentView === 'kitchen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('kitchen')}
              className="w-full h-10 text-sm touch-target relative"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              <span className="mobile-text-base tablet-text-lg font-medium">Cozinha</span>
              {pendingOrders > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {pendingOrders}
                </Badge>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {/* Connectivity status */}
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-600" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-600" />
              )}
            </div>
            
            {/* Restaurant name */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium mobile-text-sm tablet-text-base">Restaurant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mobile-margin mobile-card">
          <AlertDescription className="mobile-text-base tablet-text-lg">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="ml-3 mobile-btn touch-target"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection status */}
      {!isOnline && (
        <Alert variant="destructive" className="mobile-margin mobile-card">
          <WifiOff className="h-5 w-5" />
          <AlertDescription className="mobile-text-base tablet-text-lg">
            No connection to server. Orders may not sync properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div 
        ref={contentRef}
        className={`main-content ${
          isDynamicIsland ? 'dynamic-island-safe' :
          isNotch ? 'notch-safe' :
          isPunchHole ? 'punch-hole-header' :
          isHomeIndicator ? 'home-indicator-safe' :
          'mobile-safe-area'
        }`}
      >
        {currentView === 'orders' && (
          <OrderTaking 
            onAddOrder={addOrder}
            existingOrders={orders}
            loading={loading}
          />
        )}
        {currentView === 'phone' && (
          <PhoneOrderTaking 
            onAddOrder={addOrder}
            existingOrders={orders}
            loading={loading}
          />
        )}
        {currentView === 'kitchen' && (
          <KitchenDisplay 
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onRemoveOrder={removeOrder}
            loading={loading}
            onRefresh={loadOrders}
          />
        )}
      </div>

      <Toaster 
        position="top-center"
        expand={false}
        richColors
        closeButton
        duration={3000}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;