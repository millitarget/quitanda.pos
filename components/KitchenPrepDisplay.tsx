import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChefHat, RefreshCw } from 'lucide-react';
import type { Order } from '../App';
import { filterOrdersForStation } from '../utils/stations';
import { groupOrderItems, formatCustomizationsForDisplay } from '../utils/orderGrouping';

interface KitchenPrepDisplayProps {
  orders: Order[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function KitchenPrepDisplay({ orders, loading = false, onRefresh }: KitchenPrepDisplayProps) {
  const prepOrders = useMemo(() => filterOrdersForStation(orders, 'kitchenPrep'), [orders]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card sticky top-0 z-50 mobile-safe-area">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <h2 className="text-base font-semibold">Cozinha (Arroz/Saladas/Esparregado)</h2>
          <Badge variant="secondary" className="text-xs py-0.5 px-2 rounded-md">
            {prepOrders.length} orders
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

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4">
          {prepOrders.map((order) => {
            const grouped = groupOrderItems(order.items);
            return (
              <Card key={order.id} className="rounded-lg shadow-xs border border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <span className="text-sm font-bold">{order.queueNumber}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">#{order.queueNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    {grouped.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center gap-2">
                          {item.quantity > 1 && (
                            <Badge variant="default" className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0 rounded">
                              {item.quantity}x
                            </Badge>
                          )}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.customizationBreakdown.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.customizationBreakdown.map((b, bIdx) => (
                              <div key={bIdx} className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {formatCustomizationsForDisplay([b.customizations])[0]}
                                </div>
                                {b.quantity > 1 && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-0 rounded">{b.quantity}x</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.orderNotes && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs">
                      <div className="font-medium text-muted-foreground mb-1">Notes:</div>
                      <div>{order.orderNotes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}


