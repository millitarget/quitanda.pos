import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { MobileMenuGrid } from './MobileMenuGrid';
import { FloatingOrderSummary } from './FloatingOrderSummary';
import { NumberPadModal } from './NumberPadModal';
import { Order, OrderItem } from '../App';
import { ShoppingCart, Edit3, RefreshCw } from 'lucide-react';
import { queueApi, menuApi } from '../utils/api';
import { toast } from 'sonner';
import { groupOrderItems, formatCustomizationsForDisplay } from '../utils/orderGrouping';

interface OrderTakingProps {
  onAddOrder: (order: Omit<Order, 'id' | 'timestamp'>) => void;
  existingOrders: Order[];
  loading?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

// Default menu data as fallback
const defaultMenuData: MenuItem[] = [
  // Carne - Popular items first
  { id: '1', name: 'Frango do Churrasco', price: 7.90, category: 'Carne' },
  { id: '3', name: 'Frango da Guia (Galeto)', price: 8.00, category: 'Carne' },
  { id: '4', name: 'Espetada de Porco', price: 6.50, category: 'Carne' },
  { id: '5', name: 'Espetada de Frango c/ Bacon', price: 6.50, category: 'Carne' },
  { id: '2', name: '1/2 Frango do Churrasco', price: 4.50, category: 'Carne' },
  { id: '6', name: 'Dose de Entrecosto', price: 8.00, category: 'Carne' },
  { id: '11', name: 'Costeleta de Porco', price: 6.00, category: 'Carne' },
  { id: '7', name: '1/2 Dose de Entrecosto', price: 4.50, category: 'Carne' },
  { id: '8', name: 'Salsicha Toscana', price: 2.00, category: 'Carne' },
  { id: '9', name: 'Fêvera de Porco', price: 6.00, category: 'Carne' },
  { id: '12', name: 'Coelho', price: 12.50, category: 'Carne' },
  { id: '10', name: 'Costeleta de Vitela', price: 25.00, category: 'Carne', description: '€/kg' },
  { id: '13', name: 'Costelinha', price: 19.00, category: 'Carne', description: '€/kg' },
  { id: '14', name: 'Picanha', price: 36.50, category: 'Carne', description: '€/kg' },
  { id: '15', name: 'Bife do Lombo', price: 40.00, category: 'Carne', description: '€/kg' },

  // Acompanhamentos - Popular items first
  { id: '18', name: 'Dose de Batata Frita', price: 3.75, category: 'Acompanhamentos' },
  { id: '21', name: 'Dose de Arroz', price: 3.75, category: 'Acompanhamentos' },
  { id: '23', name: 'Salada Mista', price: 4.00, category: 'Acompanhamentos' },
  { id: '19', name: '1/2 Dose de Batata Frita', price: 2.50, category: 'Acompanhamentos' },
  { id: '22', name: '1/2 Dose de Arroz', price: 2.50, category: 'Acompanhamentos' },
  { id: '31', name: 'Broa de Milho', price: 1.90, category: 'Acompanhamentos' },
  { id: '20', name: 'Pacote de Batata Barrosa', price: 3.00, category: 'Acompanhamentos' },
  { id: '24', name: '1/2 Salada Mista', price: 2.75, category: 'Acompanhamentos' },
  { id: '25', name: 'Salada de Tomate', price: 4.00, category: 'Acompanhamentos' },
  { id: '26', name: 'Salada de Alface', price: 4.00, category: 'Acompanhamentos' },
  { id: '27', name: 'Salada de Pimentos', price: 4.50, category: 'Acompanhamentos' },
  { id: '28', name: 'Dose de Feijão Preto', price: 5.75, category: 'Acompanhamentos' },
  { id: '29', name: '1/2 Dose de Feijão Preto', price: 3.95, category: 'Acompanhamentos' },
  { id: '30', name: 'Espargado Grelos/Espinafres', price: 5.50, category: 'Acompanhamentos' },
  { id: '32', name: '1/2 Broa de Milho', price: 1.00, category: 'Acompanhamentos' },
  { id: '33', name: 'Broa de Avintes', price: 3.50, category: 'Acompanhamentos' },
  { id: '34', name: '1/2 Broa de Avintes', price: 2.00, category: 'Acompanhamentos' },
  { id: '35', name: 'Trança (Cacete)', price: 1.80, category: 'Acompanhamentos' },

  // Refrigerantes
  { id: '43', name: 'Refrigerantes 1L', price: 2.75, category: 'Bebidas' },
  { id: '44', name: 'Refrigerantes 1.5L', price: 3.00, category: 'Bebidas' },

  // Peixe
  { id: '16', name: 'Bacalhau 1P', price: 19.50, category: 'Peixe', description: 'c/ batata, ovo, pimento, cebola' },
  { id: '17', name: 'Bacalhau 2P', price: 32.50, category: 'Peixe', description: 'c/ batata, ovo, pimento, cebola' },

  // Vinhos
  { id: '36', name: 'Vinho Casa Cruzeiro', price: 4.00, category: 'Vinhos' },
  { id: '39', name: 'Vinho Porta Ravessa', price: 4.50, category: 'Vinhos' },
  { id: '40', name: 'Vinho Gaseificado', price: 5.50, category: 'Vinhos' },
  { id: '37', name: 'Vinho Branco Monção', price: 7.00, category: 'Vinhos' },
  { id: '38', name: 'Vinho Branco Casal', price: 7.00, category: 'Vinhos' },
  { id: '41', name: 'Vinho Monte Velho', price: 7.00, category: 'Vinhos' },
  { id: '42', name: 'Vinho Eugénio Almeida', price: 7.00, category: 'Vinhos' },
];

export function OrderTaking({ onAddOrder, existingOrders, loading: parentLoading }: OrderTakingProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Carne');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [menuData, setMenuData] = useState<MenuItem[]>(defaultMenuData);
  const [menuLoading, setMenuLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [quantityMultiplier, setQuantityMultiplier] = useState<number>(1);

  const categories = ['Todos', 'Carne', 'Acompanhamentos', 'Bebidas', 'Peixe', 'Vinhos'];

  // Load menu from backend
  const loadMenu = async () => {
    try {
      setMenuLoading(true);
      const response = await menuApi.getMenu();
      if (response.items && response.items.length > 0) {
        setMenuData(response.items);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      // Keep using default menu data if API fails
      toast.error('Using offline menu - some items may be outdated');
    } finally {
      setMenuLoading(false);
    }
  };

  // Get next queue number from backend
  const getNextQueueNumber = async () => {
    try {
      const response = await queueApi.getNextQueueNumber();
      setQueueNumber(response.queueNumber);
    } catch (err) {
      console.error('Error getting next queue number:', err);
      // Fallback to local calculation
      const maxQueue = existingOrders.reduce((max, order) => 
        Math.max(max, order.queueNumber), 0);
      setQueueNumber(maxQueue + 1);
    }
  };

  useEffect(() => {
    loadMenu();
    getNextQueueNumber();
  }, []);

  useEffect(() => {
    // Update queue number when orders change
    if (existingOrders.length > 0) {
      getNextQueueNumber();
    }
  }, [existingOrders.length]);
  
  const addItemToOrder = (menuItem: MenuItem, customizations: { sauces?: string[]; chickenType?: string }) => {
    const newItems: OrderItem[] = [];
    for (let i = 0; i < Math.max(1, quantityMultiplier); i++) {
      newItems.push({
        id: `${menuItem.id}-${Date.now()}-${i}`,
        name: menuItem.name,
        price: menuItem.price,
        category: menuItem.category,
        customizations,
      });
    }
    setCurrentOrder(prev => [...prev, ...newItems]);
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  };

  const submitOrder = async (orderNotes?: string) => {
    if (currentOrder.length === 0) return;
    
    setSubmitting(true);
    try {
      const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
      
      const orderData = {
        queueNumber,
        items: currentOrder,
        status: 'pending' as const,
        total,
        orderNotes,
      };
      
      await onAddOrder(orderData);
      
      setCurrentOrder([]);
      setShowOrderSummary(false);
      
      // Get next queue number for the next order
      await getNextQueueNumber();
      
      toast.success(`Order #${queueNumber} submitted successfully!`);
    } catch (err: any) {
      console.error('Error submitting order:', err);
      toast.error('Failed to submit order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
  const isQueueNumberTaken = existingOrders.some(order => order.queueNumber === queueNumber);

  const handleChangeQuantity = (
    action: 'inc' | 'dec',
    match: { name: string; price: number; category: string; customizations: OrderItem['customizations'] }
  ) => {
    if (action === 'inc') {
      const newItem: OrderItem = {
        id: `${match.name}-${Date.now()}`,
        name: match.name,
        price: match.price,
        category: match.category,
        customizations: match.customizations,
      };
      setCurrentOrder(prev => [...prev, newItem]);
      return;
    }
    setCurrentOrder(prev => {
      const idx = prev.findIndex(it =>
        it.name === match.name &&
        it.price === match.price &&
        it.category === match.category &&
        JSON.stringify(it.customizations) === JSON.stringify(match.customizations)
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header: Queue + Total + Cart */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Nº</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNumberPad(true)}
            className={`h-9 px-3 text-sm font-mono rounded-md ${isQueueNumberTaken ? 'border-red-500 text-red-600' : ''}`}
          >
            {queueNumber}
            <Edit3 className="h-4 w-4 ml-2" />
          </Button>
          {isQueueNumberTaken && (
            <Badge variant="destructive" className="text-xs py-0 px-2 rounded">
              Usado
            </Badge>
          )}
          
          {/* Refresh button for menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMenu}
            disabled={menuLoading}
            className="h-9 w-9 p-0 rounded-md"
          >
            <RefreshCw className={`h-4 w-4 ${menuLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {currentOrder.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrderSummary(true)}
              className="relative h-9 w-9 p-0 rounded-md"
            >
              <ShoppingCart className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center rounded-full"
              >
                {currentOrder.length}
              </Badge>
            </Button>
          )}
          <Badge variant="secondary" className="text-sm py-1.5 px-2.5 rounded-md">
            €{total.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Category Navigation + Search + Qty Multiplier */}
      <div className="border-b bg-card sticky top-[44px] z-30">
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-3 py-2 min-w-max">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap px-3 py-2 h-9 text-sm rounded-md"
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="px-3 pb-2 flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procurar item..."
            className="h-9 text-sm"
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 5].map((q) => (
              <Button
                key={q}
                variant={quantityMultiplier === q ? 'default' : 'outline'}
                size="sm"
                className="h-9 px-2 text-xs rounded-md"
                onClick={() => setQuantityMultiplier(q)}
              >
                x{q}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop 15'' layout: grid with right sidebar */}
      <div className="flex-1 overflow-auto lg:grid lg:grid-cols-[1fr,360px] lg:gap-3">
        <div>
          {menuLoading ? (
            <div className="flex items-center justify-center h-32 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">A carregar menu...</span>
            </div>
          ) : (
            <MobileMenuGrid
              category={selectedCategory}
              items={menuData
                .filter(item => selectedCategory === 'Todos' || item.category === selectedCategory)
                .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))}
              onAddItem={addItemToOrder}
            />
          )}
        </div>

        {/* Sidebar summary (visible on lg+) */}
        <div className="hidden lg:block sticky top-[96px] self-start max-h-[calc(100vh-120px)] overflow-auto">
          <div className="border rounded-md bg-card">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carrinho</span>
                <Badge variant="secondary" className="text-sm">€{total.toFixed(2)}</Badge>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {currentOrder.length === 0 ? (
                <p className="text-sm text-muted-foreground">Vazio</p>
              ) : (
                (() => {
                  const grouped = groupOrderItems(currentOrder);
                  return (
                    <div className="space-y-2">
                      {grouped.items.map((g, idx) => (
                        <div key={`${g.name}-${idx}`} className="p-2 border rounded">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {g.quantity > 1 && (
                                <Badge variant="default" className="text-xs px-2 py-0">{g.quantity}x</Badge>
                              )}
                              <h4 className="text-sm font-medium leading-tight">{g.name}</h4>
                            </div>
                            <Badge variant="secondary" className="text-xs">€{g.totalPrice.toFixed(2)}</Badge>
                          </div>
                          {g.customizationBreakdown.map((b, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 ml-6">
                              <p className="text-xs text-muted-foreground flex-1">
                                {formatCustomizationsForDisplay([b.customizations])[0]}
                              </p>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline" size="sm" className="h-6 w-6 p-0"
                                  onClick={() => handleChangeQuantity('dec', { name: g.name, price: g.price, category: g.category, customizations: b.customizations })}
                                >-</Button>
                                <Badge variant="outline" className="text-xs px-2 py-0">{b.quantity}x</Badge>
                                <Button
                                  variant="outline" size="sm" className="h-6 w-6 p-0"
                                  onClick={() => handleChangeQuantity('inc', { name: g.name, price: g.price, category: g.category, customizations: b.customizations })}
                                >+</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
            <div className="p-3 border-t grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={clearOrder} disabled={submitting}>Limpar</Button>
              <Button onClick={() => submitOrder()} disabled={isQueueNumberTaken || submitting || parentLoading} className="bg-green-600 hover:bg-green-700">Enviar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {currentOrder.length > 0 && (
        <div className="border-t bg-card px-3 py-3 sticky bottom-0 z-40">
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              onClick={clearOrder}
              className="flex-1 h-10 text-sm rounded-md"
              disabled={submitting}
            >
              Limpar
            </Button>
            <Button 
              onClick={() => submitOrder()}
              disabled={isQueueNumberTaken || submitting || parentLoading}
              className="flex-2 h-10 text-sm rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                `Enviar (${currentOrder.length})`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Number Pad Modal */}
      <NumberPadModal
        isOpen={showNumberPad}
        onClose={() => setShowNumberPad(false)}
        currentNumber={queueNumber}
        onNumberChange={setQueueNumber}
        existingNumbers={existingOrders.map(order => order.queueNumber)}
      />

      {/* Floating Order Summary */}
      <FloatingOrderSummary
        isOpen={showOrderSummary}
        onClose={() => setShowOrderSummary(false)}
        items={currentOrder}
        onRemoveItem={removeItemFromOrder}
        onSubmitOrder={submitOrder}
        onClearOrder={clearOrder}
        total={total}
        submitting={submitting}
      />
    </div>
  );
}