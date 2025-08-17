import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';
import { OrderItem } from '../App';
import { groupOrderItems, formatCustomizationsForDisplay, GroupedOrderItem } from '../utils/orderGrouping';

interface OrderSummaryProps {
  items: OrderItem[];
  queueNumber: number;
  onRemoveItem: (itemId: string) => void;
  onSubmitOrder: () => void;
  onClearOrder: () => void;
}

export function OrderSummary({ 
  items, 
  queueNumber, 
  onRemoveItem, 
  onSubmitOrder, 
  onClearOrder 
}: OrderSummaryProps) {
  const groupedOrder = groupOrderItems(items);
  const total = groupedOrder.total;

  return (
    <Card className="h-full flex flex-col rounded-none border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          Pedido #{queueNumber}
          {items.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearOrder}
              className="text-destructive hover:text-destructive"
            >
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col px-4">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-center">
              Nenhum item selecionado.<br />
              Escolha itens do menu para começar.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-2">
              <div className="space-y-3 px-2">
                {groupedOrder.items.map((groupedItem, index) => (
                  <div key={`${groupedItem.name}-${index}`} className="pb-3 border-b border-border/50 last:border-0">
                    {/* Item Header with Total Quantity */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {groupedItem.quantity > 1 && (
                            <Badge 
                              variant="default" 
                              className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1"
                            >
                              {groupedItem.quantity}x
                            </Badge>
                          )}
                          <p className="font-medium text-sm leading-tight">
                            {groupedItem.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          €{groupedItem.totalPrice.toFixed(2)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Remove all items in this group
                            groupedItem.items.forEach(item => onRemoveItem(item.id));
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Customization Breakdown */}
                    {groupedItem.customizationBreakdown.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {groupedItem.customizationBreakdown.map((breakdown, breakdownIndex) => (
                          <div key={breakdownIndex} className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatCustomizationsForDisplay([breakdown.customizations])[0]}
                            </p>
                            {breakdown.quantity > 1 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                {breakdown.quantity}x
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-medium">€{total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={onSubmitOrder} 
                className="w-full"
                size="lg"
              >
                Enviar para Cozinha
                <Badge variant="secondary" className="ml-2">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </Badge>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}