import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Order } from '../App';
import { Clock, ChefHat, CheckCircle, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { groupOrderItems, formatCustomizationsForDisplay } from '../utils/orderGrouping';

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
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-50 mobile-safe-area">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <h2 className="text-base font-semibold">Kitchen Display</h2>
          <Badge variant="secondary" className="text-xs py-0.5 px-2 rounded-md">
            {orders.length} orders
          </Badge>
        </div>
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2 h-10 rounded-md"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4">
            {sortedOrders.map((order) => {
              const groupedOrder = groupOrderItems(order.items);
              
              return (
                <Card 
                  key={order.id} 
                  className={`relative transition-all duration-200 rounded-lg shadow-xs border border-border/60 ${
                    order.status === 'pending' ? 'ring-1 ring-yellow-400/50' : 
                    order.status === 'ready' ? 'ring-1 ring-green-400/50' : ''
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
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive rounded-md"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {groupedOrder.items.map((groupedItem, index) => (
                        <div key={`${groupedItem.name}-${index}`} className="text-sm">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              id={`${order.id}-${groupedItem.name}-${index}`}
                              checked={groupedItem.items.every(item => 
                                isItemChecked(order.id, item.id)
                              )}
                              onCheckedChange={(checked) => {
                                // Check/uncheck all items in this group
                                groupedItem.items.forEach(item => 
                                  handleItemCheck(order.id, item.id, checked as boolean)
                                );
                              }}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className={`font-medium flex items-center gap-2 ${
                                groupedItem.items.every(item => isItemChecked(order.id, item.id)) 
                                  ? 'line-through text-muted-foreground' : ''
                              }`}>
                                {groupedItem.quantity > 1 && (
                                  <Badge 
                                    variant="default" 
                                    className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0 rounded"
                                  >
                                    {groupedItem.quantity}x
                                  </Badge>
                                )}
                                {groupedItem.name}
                              </div>
                              
                              {/* Customization Breakdown */}
                              {groupedItem.customizationBreakdown.length > 0 && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {groupedItem.customizationBreakdown.map((breakdown, breakdownIndex) => (
                                    <div key={breakdownIndex} className="flex items-center justify-between">
                                      <div className={`text-xs text-muted-foreground ${
                                        groupedItem.items.every(item => isItemChecked(order.id, item.id)) 
                                          ? 'line-through' : ''
                                      }`}>
                                        {formatCustomizationsForDisplay([breakdown.customizations])[0]}
                                      </div>
                                      {breakdown.quantity > 1 && (
                                        <Badge variant="outline" className="text-[10px] px-2 py-0 rounded">
                                          {breakdown.quantity}x
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
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
                      <Badge variant="default" className="text-xs py-0.5 px-2 rounded">
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
                          className="flex-1 h-10 text-sm rounded-md bg-blue-600 hover:bg-blue-700"
                        >
                          <ChefHat className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(order.id, 'ready')}
                          className="flex-1 h-10 text-sm rounded-md bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ready
                        </Button>
                      )}
                      
                      {order.status === 'ready' && (
                        <Badge variant="default" className="flex-1 justify-center py-2 bg-green-600 rounded-md">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ready for Pickup
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}