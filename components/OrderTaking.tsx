import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MobileMenuGrid } from './MobileMenuGrid';
import { FloatingOrderSummary } from './FloatingOrderSummary';
import { FloatingCartPill } from './FloatingCartPill';
import { NumberPadModal } from './NumberPadModal';
import { Order, OrderItem } from '../App';
import { ShoppingCart, Edit3, RefreshCw } from 'lucide-react';
import { queueApi, menuApi } from '../utils/api';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [menuData, setMenuData] = useState<MenuItem[]>(defaultMenuData);
  const [menuLoading, setMenuLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Carne', 'Acompanhamentos', 'Bebidas', 'Peixe', 'Vinhos'];

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
    const orderItem: OrderItem = {
      id: `${menuItem.id}-${Date.now()}`,
      name: menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      customizations,
    };
    
    setCurrentOrder(prev => [...prev, orderItem]);
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

      {/* Category Navigation */}
      <div className="border-b bg-card sticky-below-header">
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
      </div>

      {/* Sticky Search Bar */}
      <div className="bg-card border-b px-3 py-2 sticky-below-header-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar itens (ex: frango, salada, vinho)"
          className="h-10 rounded-md text-sm"
        />
      </div>

      {/* Menu Items Grid */}
      {/* Scrollable Items Only */}
      <div className="flex-1 overflow-auto">
        {menuLoading ? (
          <div className="flex items-center justify-center h-32 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">A carregar menu...</span>
          </div>
        ) : (
          <MobileMenuGrid
            category={selectedCategory}
            items={menuData
              .filter(item => item.category === selectedCategory)
              .filter(item =>
                searchTerm.trim().length === 0
                  ? true
                  : item.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
            onAddItem={addItemToOrder}
          />
        )}
      </div>

      {/* Floating Cart Pill (non-intrusive) */}
      <FloatingCartPill
        count={currentOrder.length}
        total={total}
        onOpenSummary={() => setShowOrderSummary(true)}
        onSubmit={() => submitOrder()}
        submitting={submitting}
      />

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