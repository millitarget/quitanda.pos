import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MobileMenuGrid } from './MobileMenuGrid';
import { FloatingOrderSummary } from './FloatingOrderSummary';
import { FloatingCartPill } from './FloatingCartPill';
import { NumberPadModal } from './NumberPadModal';
import { Order, OrderItem } from '../App';
import { RefreshCw, PhoneCall, User, Clock, ShoppingCart, Edit3 } from 'lucide-react';
import { queueApi, menuApi } from '../utils/api';
import { toast } from 'sonner';
import { Input } from './ui/input';

interface PhoneOrderTakingProps {
  onAddOrder: (order: Omit<Order, 'id' | 'timestamp' | 'userId'>) => Promise<void> | void;
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

const timeOptions = (intervalMins = 10, horizonMins = 120) => {
  const now = new Date();
  now.setSeconds(0, 0);
  const start = new Date(now.getTime() + 10 * 60 * 1000);
  const options: string[] = [];
  for (let m = 0; m <= horizonMins; m += intervalMins) {
    const t = new Date(start.getTime() + m * 60 * 1000);
    const hh = t.getHours().toString().padStart(2, '0');
    const mm = t.getMinutes().toString().padStart(2, '0');
    options.push(`${hh}:${mm}`);
  }
  return options;
};

// Default menu as fallback in offline mode
const defaultMenuData: MenuItem[] = [];

export function PhoneOrderTaking({ onAddOrder, existingOrders, loading: parentLoading }: PhoneOrderTakingProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Carne');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>(timeOptions()[0] ?? '');
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [menuData, setMenuData] = useState<MenuItem[]>(defaultMenuData);
  const [menuLoading, setMenuLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Carne', 'Acompanhamentos', 'Bebidas', 'Peixe', 'Vinhos'];

  const loadMenu = async () => {
    try {
      setMenuLoading(true);
      const response = await menuApi.getMenu();
      if (response.items && response.items.length > 0) setMenuData(response.items);
    } catch (err) {
      console.error('Error loading menu:', err);
      toast.error('A usar menu offline');
    } finally {
      setMenuLoading(false);
    }
  };

  const getNextQueueNumber = async () => {
    try {
      const response = await queueApi.getNextQueueNumber();
      setQueueNumber(response.queueNumber);
    } catch (err) {
      console.error('Error getting next queue number:', err);
      const maxQueue = existingOrders.reduce((max, order) => Math.max(max, order.queueNumber), 0);
      setQueueNumber(maxQueue + 1);
    }
  };

  useEffect(() => {
    loadMenu();
    getNextQueueNumber();
  }, []);

  useEffect(() => {
    if (existingOrders.length > 0) getNextQueueNumber();
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

  const clearOrder = () => setCurrentOrder([]);

  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
  const isQueueNumberTaken = existingOrders.some(order => order.queueNumber === queueNumber);

  const submitOrder = async (additionalNotes?: string) => {
    if (currentOrder.length === 0) return;
    if (!customerName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    if (!pickupTime.trim()) {
      toast.error('Hora de levantamento é obrigatória');
      return;
    }

    const prefix = `[PHONE] Nome: ${customerName.trim()} | Levantamento: ${pickupTime}`;
    const orderNotes = additionalNotes && additionalNotes.trim().length > 0
      ? `${prefix} | ${additionalNotes.trim()}`
      : prefix;

    setSubmitting(true);
    try {
      await onAddOrder({
        queueNumber,
        items: currentOrder,
        status: 'pending',
        total,
        orderNotes,
      } as any);

      clearOrder();
      await getNextQueueNumber();
      toast.success(`Encomenda telefónica #${queueNumber} registada`);
    } catch (err: any) {
      console.error('Error submitting phone order:', err);
      toast.error('Falha ao submeter encomenda: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Phone Order Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1"><PhoneCall className="h-3 w-3" /> Telefone</Badge>
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
            <Badge variant="destructive" className="text-xs py-0 px-2 rounded">Usado</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentOrder.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Resumo disponível no botão flutuante')}
              className="relative h-9 w-9 p-0 rounded-md"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
          <Badge variant="secondary" className="text-sm py-1.5 px-2.5 rounded-md">€{total.toFixed(2)}</Badge>
          <Button variant="ghost" size="sm" onClick={loadMenu} disabled={menuLoading} className="h-9 w-9 p-0 rounded-md">
            <RefreshCw className={`h-4 w-4 ${menuLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Customer Info Bar */}
      <div className="bg-card border-b px-3 py-2 sticky-below-header grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome do cliente"
            className="h-10 rounded-md text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            list="pickup-times"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            placeholder="HH:MM"
            className="h-10 rounded-md text-sm"
          />
          <datalist id="pickup-times">
            {timeOptions().map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b bg-card sticky-below-header-2">
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

      {/* Search */}
      <div className="bg-card border-b px-3 py-2 sticky-below-header-3">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar itens (ex: frango, salada, vinho)"
          className="h-10 rounded-md text-sm"
        />
      </div>

      {/* Scrollable Menu Items */}
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
              .filter(item => searchTerm.trim().length === 0 ? true : item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            }
            onAddItem={addItemToOrder}
          />
        )}
      </div>

      {/* Number Pad Modal */}
      <NumberPadModal
        isOpen={showNumberPad}
        onClose={() => setShowNumberPad(false)}
        currentNumber={queueNumber}
        onNumberChange={setQueueNumber}
        existingNumbers={existingOrders.map(order => order.queueNumber)}
      />

      {/* Floating Order Summary + Submit */}
      <FloatingCartPill
        count={currentOrder.length}
        total={total}
        onOpenSummary={() => toast.info('Resumo disponível abaixo')}
        onSubmit={() => submitOrder()}
        submitting={submitting}
      />

      <FloatingOrderSummary
        isOpen={false}
        onClose={() => {}}
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


