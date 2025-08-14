import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Order } from '../App';
import { Clock, ChefHat, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onRemoveOrder: (orderId: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function KitchenDisplay({ 
  orders, 
  onUpdateStatus, 
  onRemoveOrder, 
  loading = false,
  onRefresh 
}: KitchenDisplayProps) {
  // State to track checked items for employee organization
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleItemCheck = (orderId: string, itemId: string, checked: boolean) => {
    const key = `${orderId}-${itemId}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const isItemChecked = (orderId: string, itemId: string) => {
    const key = `${orderId}-${itemId}`;
    return checkedItems[key] || false;
  };
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'preparing': return <ChefHat className="h-3 w-3" />;
      case 'ready': return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatCustomizations = (customizations: { sauces?: string[]; chickenType?: string }) => {
    const parts = [];
    if (customizations.sauces && customizations.sauces.length > 0) {
      parts.push(customizations.sauces.join(', '));
    }
    if (customizations.chickenType) {
      parts.push(customizations.chickenType);
    }
    return parts.join(' • ');
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeSinceOrder = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes === 1) return '1 min';
    return `${diffInMinutes} min`;
  };

  // Sort orders: pending first, then by timestamp (oldest first for pending, newest first for others)
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    if (a.status === 'pending' && b.status === 'pending') {
      return a.timestamp.getTime() - b.timestamp.getTime(); // Oldest pending first
    }
    
    return b.timestamp.getTime() - a.timestamp.getTime(); // Newest non-pending first
  });

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with refresh */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Kitchen Display</h2>
          <Badge variant="secondary" className="text-xs">
            {orders.length} orders
          </Badge>
        </div>
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Orders
            </h3>
            <p className="text-sm text-muted-foreground">
              Orders will appear here when customers place them
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {sortedOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`relative transition-all duration-200 ${
                  order.status === 'pending' ? 'ring-2 ring-yellow-400' : 
                  order.status === 'ready' ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${getStatusColor(order.status)} flex items-center justify-center text-white`}>
                        <span className="text-sm font-bold">{order.queueNumber}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">#{order.queueNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(order.timestamp)} • {getTimeSinceOrder(order.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOrder(order.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="text-sm">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`${order.id}-${item.id}`}
                            checked={isItemChecked(order.id, item.id)}
                            onCheckedChange={(checked) => 
                              handleItemCheck(order.id, item.id, checked as boolean)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${
                              isItemChecked(order.id, item.id) ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {item.name}
                            </div>
                            {formatCustomizations(item.customizations) && (
                              <div className={`text-xs text-muted-foreground mt-1 ${
                                isItemChecked(order.id, item.id) ? 'line-through' : ''
                              }`}>
                                {formatCustomizations(item.customizations)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.orderNotes && (
                    <div className="mb-4 p-2 bg-muted rounded text-xs">
                      <div className="font-medium text-muted-foreground mb-1">Notes:</div>
                      <div>{order.orderNotes}</div>
                    </div>
                  )}

                  {/* Order Total */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      {order.items.length} items
                    </Badge>
                    <div className="font-semibold">€{order.total.toFixed(2)}</div>
                  </div>

                  {/* Status Controls */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                        className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <ChefHat className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Button>
                    )}
                    
                    {order.status === 'ready' && (
                      <Badge variant="default" className="flex-1 justify-center py-1 bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready for Pickup
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}