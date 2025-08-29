import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Trash2, X, FileText, RefreshCw, Plus, Minus, RotateCcw } from 'lucide-react';
import { OrderItem } from '../App';
import { OrderNotesModal } from './OrderNotesModal';
import { groupOrderItems, formatCustomizationsForDisplay } from '../utils/orderGrouping';

interface FloatingOrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onSubmitOrder: (orderNotes?: string) => void;
  onClearOrder: () => void;
  total: number;
  submitting?: boolean;
  onChangeQuantity?: (
    action: 'inc' | 'dec',
    match: { name: string; price: number; category: string; customizations: OrderItem['customizations'] }
  ) => void;
}

export function FloatingOrderSummary({ 
  isOpen,
  onClose,
  items, 
  onRemoveItem, 
  onSubmitOrder, 
  onClearOrder,
  total,
  submitting = false,
  onChangeQuantity,
}: FloatingOrderSummaryProps) {
  const [orderNotes, setOrderNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const groupedOrder = groupOrderItems(items);

  const handleSubmit = () => {
    onSubmitOrder(orderNotes || undefined);
    onClose();
    setOrderNotes(''); // Reset order notes after submit
  };

  const handleClear = () => {
    const previous = [...items];
    onClearOrder();
    setOrderNotes(''); // Reset order notes when clearing
    // Simple undo via custom event; consuming component can listen or ignore
    const ev = new CustomEvent('cart:cleared', { detail: { previous } });
    window.dispatchEvent(ev);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[70vh] p-0">
          <SheetHeader className="p-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm">Carrinho ({items.length})</SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
                <p className="text-center text-sm">Carrinho vazio</p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {/* Order Notes Section */}
                    <div className="p-2 bg-blue-50 rounded border border-blue-200 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-xs font-medium text-blue-800 mb-1">Observações do Pedido:</h4>
                          {orderNotes ? (
                            <p className="text-xs text-blue-700">{orderNotes}</p>
                          ) : (
                            <p className="text-xs text-blue-600 italic">Nenhuma observação</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNotesModal(true)}
                          className={`h-7 w-7 p-0 ml-2 ${orderNotes ? 'bg-blue-100 border-blue-300' : ''}`}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Order Items */}
                    {groupedOrder.items.map((groupedItem, index) => (
                      <div key={`${groupedItem.name}-${index}`} className="p-2 bg-card rounded border">
                        {/* Item Header with Total Quantity */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {groupedItem.quantity > 1 && (
                                <Badge 
                                  variant="default" 
                                  className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0"
                                >
                                  {groupedItem.quantity}x
                                </Badge>
                              )}
                              <h4 className="font-medium text-sm leading-tight">{groupedItem.name}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs py-0 px-2">
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
                              <div key={breakdownIndex} className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
                                  {formatCustomizationsForDisplay([breakdown.customizations])[0]}
                                </p>
                                <div className="flex items-center gap-1">
                                  {onChangeQuantity && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => onChangeQuantity('dec', {
                                          name: groupedItem.name,
                                          price: groupedItem.price,
                                          category: groupedItem.category,
                                          customizations: breakdown.customizations,
                                        })}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                  <Badge variant="outline" className="text-xs px-2 py-0 min-w-[28px] text-center">
                                    {breakdown.quantity}x
                                  </Badge>
                                  {onChangeQuantity && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => onChangeQuantity('inc', {
                                        name: groupedItem.name,
                                        price: groupedItem.price,
                                        category: groupedItem.category,
                                        customizations: breakdown.customizations,
                                      })}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Action Bar */}
                <div className="border-t bg-card p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Total:</span>
                    <span className="font-medium text-sm">€{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Limpar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="flex-2 bg-green-600 hover:bg-green-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Pedido (€{total.toFixed(2)})
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Notes Modal */}
      <OrderNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        currentNotes={orderNotes}
        onNotesChange={setOrderNotes}
      />
    </>
  );
}