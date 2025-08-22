import { Order, OrderItem } from '../App';

export type Station = 'grill' | 'kitchenPrep' | 'fryer';

// Heuristics to classify items per station. Adjust as your menu evolves.
export function isGrillItem(item: OrderItem): boolean {
  const name = item.name.toLowerCase();
  const grillKeywords = [
    'frango',
    'galeto',
    'espetada',
    'entrecosto',
    'costeleta',
    'coelho',
    'costelinha',
    'picanha',
    'lombo',
    'churrasco',
  ];
  return item.category.toLowerCase() === 'carne' || grillKeywords.some(k => name.includes(k));
}

export function isKitchenPrepItem(item: OrderItem): boolean {
  const name = item.name.toLowerCase();
  // Explicit per user: arroz, salada (all), esparregado
  return (
    name.includes('arroz') ||
    name.includes('salada') ||
    name.includes('espargado') ||
    name.includes('esparregado')
  );
}

export function isFryerItem(item: OrderItem): boolean {
  const name = item.name.toLowerCase();
  // Fries only
  return name.includes('batata frita');
}

export function filterOrderItemsByStation(order: Order, station: Station): OrderItem[] {
  const predicate = station === 'grill' ? isGrillItem : station === 'kitchenPrep' ? isKitchenPrepItem : isFryerItem;
  return order.items.filter(predicate);
}

export function filterOrdersForStation(orders: Order[], station: Station): Array<{
  id: string;
  queueNumber: number;
  items: OrderItem[];
  timestamp: Date;
  status: Order['status'];
  total: number;
  orderNotes?: string;
}> {
  return orders
    .map(o => ({
      id: o.id,
      queueNumber: o.queueNumber,
      items: filterOrderItemsByStation(o, station),
      timestamp: o.timestamp,
      status: o.status,
      total: o.total,
      orderNotes: o.orderNotes,
    }))
    .filter(o => o.items.length > 0);
}

export interface AggregatedLineItem {
  name: string;
  quantity: number;
  totalPrice: number;
  customizations: OrderItem['customizations'][];
}

export function aggregateItems(items: OrderItem[]): AggregatedLineItem[] {
  if (items.length === 0) return [];

  const groups = new Map<string, AggregatedLineItem>();
  for (const it of items) {
    const key = `${it.name}__${getCustomizationKey(it.customizations)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += it.price;
      existing.customizations.push(it.customizations);
    } else {
      groups.set(key, {
        name: it.name,
        quantity: 1,
        totalPrice: it.price,
        customizations: [it.customizations],
      });
    }
  }
  return Array.from(groups.values());
}

function getCustomizationKey(customizations: OrderItem['customizations']): string {
  const parts: string[] = [];
  if (customizations.sauces && customizations.sauces.length > 0) {
    parts.push(`s:${[...customizations.sauces].sort().join(',')}`);
  }
  if (customizations.chickenType) {
    parts.push(`c:${customizations.chickenType}`);
  }
  return parts.join('|') || 'none';
}


