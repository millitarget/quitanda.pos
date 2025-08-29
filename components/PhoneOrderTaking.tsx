import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { MobileMenuGrid } from './MobileMenuGrid';
import { FloatingOrderSummary } from './FloatingOrderSummary';
import { RefreshCw, ShoppingCart } from 'lucide-react';
import type { Order, OrderItem } from '../App';
import type { MenuItem } from './OrderTaking';
import { menuApi, queueApi } from '../utils/api';
import { toast } from 'sonner';

interface PhoneOrderTakingProps {
  onAddOrder: (order: Omit<Order, 'id' | 'timestamp' | 'userId'>) => void;
  existingOrders: Order[];
  loading?: boolean;
}

// Fallback menu (kept minimal to avoid duplication). If needed, expand later.
const fallbackMenu: MenuItem[] = [
  { id: '1', name: 'Frango do Churrasco', price: 7.90, category: 'Carne' },
  { id: '18', name: 'Dose de Batata Frita', price: 3.75, category: 'Acompanhamentos' },
  { id: '21', name: 'Dose de Arroz', price: 3.75, category: 'Acompanhamentos' },
  { id: '43', name: 'Refrigerantes 1L', price: 2.75, category: 'Bebidas' },
];

export function PhoneOrderTaking({ onAddOrder, existingOrders, loading: parentLoading }: PhoneOrderTakingProps) {
  const [customerName, setCustomerName] = useState('');
  const [pickupTime, setPickupTime] = useState(''); // HH:MM
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [menuData, setMenuData] = useState<MenuItem[]>(fallbackMenu);
  const [selectedCategory, setSelectedCategory] = useState<string>('Carne');
  const [menuLoading, setMenuLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [search, setSearch] = useState('');
  const [quantityMultiplier, setQuantityMultiplier] = useState<number>(1);

  const categories = ['Carne', 'Acompanhamentos', 'Bebidas', 'Peixe', 'Vinhos'];

  const loadMenu = async () => {
    try {
      setMenuLoading(true);
      const response = await menuApi.getMenu();
      if (response.items && response.items.length > 0) {
        setMenuData(response.items);
      } else {
        setMenuData(fallbackMenu);
      }
    } catch (err) {
      console.error('Erro a carregar menu (Telefone):', err);
      toast.error('A usar menu offline');
      setMenuData(fallbackMenu);
    } finally {
      setMenuLoading(false);
    }
  };

  const getNextQueueNumber = async () => {
    try {
      const response = await queueApi.getNextQueueNumber();
      setQueueNumber(response.queueNumber);
    } catch (err) {
      console.error('Erro a obter nº fila:', err);
      const maxQueue = existingOrders.reduce((max, order) => Math.max(max, order.queueNumber), 0);
      setQueueNumber(maxQueue + 1);
    }
  };

  useEffect(() => {
    loadMenu();
    getNextQueueNumber();
  }, []);

  useEffect(() => {
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

  const clearOrder = () => setCurrentOrder([]);

  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

  const submitOrder = async () => {
    if (currentOrder.length === 0) return;
    setSubmitting(true);
    try {
      const notesParts = [] as string[];
      if (customerName.trim()) notesParts.push(`Cliente: ${customerName.trim()}`);
      if (pickupTime.trim()) notesParts.push(`Hora: ${pickupTime.trim()}`);
      const orderNotes = notesParts.join(' | ');

      const orderData = {
        queueNumber,
        items: currentOrder,
        status: 'pending' as const,
        total,
        orderNotes,
      };

      await onAddOrder(orderData);

      clearOrder();
      setCustomerName('');
      setPickupTime('');
      setShowOrderSummary(false);
      await getNextQueueNumber();
      toast.success(`Pedido #${queueNumber} criado`);
    } catch (err: any) {
      console.error('Erro ao enviar pedido:', err);
      toast.error('Falha ao enviar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const isQueueNumberTaken = existingOrders.some(order => order.queueNumber === queueNumber);

  // Quantity change from summary per customization set
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
    // dec: remove first matching item
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

  // Helper: compute time strings
  const formatTime = (date: Date) => {
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mm = `${date.getMinutes()}`.padStart(2, '0');
    return `${hh}:${mm}`;
  };
  const setTimeNow = () => setPickupTime(formatTime(new Date()));
  const addMinutes = (mins: number) => {
    const base = pickupTime ? (() => {
      const [h, m] = pickupTime.split(':').map(n => parseInt(n));
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    })() : new Date();
    base.setMinutes(base.getMinutes() + mins);
    setPickupTime(formatTime(base));
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header: Nome + Hora + Total + Cart */}
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b sticky top-0 z-40">
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col gap-1 w-1/2 min-w-[140px]">
              <Label htmlFor="customerName" className="text-[11px]">Nome</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cliente"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 w-[130px]">
              <Label htmlFor="pickupTime" className="text-[11px]">Hora</Label>
              <Input
                id="pickupTime"
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            {isQueueNumberTaken && (
              <Badge variant="destructive" className="text-xs py-0 px-2 rounded mt-5">Usado</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMenu}
              disabled={menuLoading}
              className="h-9 w-9 p-0 rounded-md mt-5"
              aria-label="Atualizar menu"
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
                aria-label="Ver carrinho"
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
      </div>

      {/* Category Navigation + Search + Qty Multiplier + Time Chips */}
      <div className="border-b bg-card sticky top-[44px] z-30">
        <div className="px-3 py-2 space-y-2">
          <div className="flex gap-2">
            <ScrollArea className="w-full">
              <div className="flex gap-2 min-w-max">
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

          <div className="flex gap-2 items-center">
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

          <div className="flex gap-1 items-center">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={setTimeNow}>Agora</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMinutes(15)}>+15</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMinutes(30)}>+30</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMinutes(45)}>+45</Button>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
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
              .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))}
            onAddItem={addItemToOrder}
          />
        )}
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
              onClick={submitOrder}
              disabled={submitting || parentLoading || isQueueNumberTaken}
              className="flex-2 h-10 text-sm rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  A enviar...
                </>
              ) : (
                `Enviar (${currentOrder.length})`
              )}
            </Button>
          </div>
        </div>
      )}

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
        onChangeQuantity={handleChangeQuantity}
      />
    </div>
  );
}

export default PhoneOrderTaking;


