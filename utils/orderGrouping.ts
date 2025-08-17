import { OrderItem } from '../App';

export interface GroupedOrderItem {
  name: string;
  price: number;
  category: string;
  quantity: number;
  customizations: OrderItem['customizations'][];
  totalPrice: number;
  items: OrderItem[]; // Original items for reference
  customizationBreakdown: Array<{
    customizations: OrderItem['customizations'];
    quantity: number;
  }>;
}

export interface GroupedOrder {
  items: GroupedOrderItem[];
  total: number;
}

/**
 * Groups order items by name first, then shows customization breakdown
 * Items with the same name are grouped together showing total quantity
 * Customizations are shown below with individual quantities
 */
export function groupOrderItems(items: OrderItem[]): GroupedOrder {
  if (items.length === 0) {
    return { items: [], total: 0 };
  }

  // Group items by name first
  const nameGroups = new Map<string, OrderItem[]>();
  
  for (const item of items) {
    const key = item.name;
    if (!nameGroups.has(key)) {
      nameGroups.set(key, []);
    }
    nameGroups.get(key)!.push(item);
  }

  const groupedItems: GroupedOrderItem[] = [];
  let total = 0;

  // Process each name group
  for (const [name, nameItems] of nameGroups) {
    const totalPrice = nameItems.reduce((sum: number, item: OrderItem) => sum + item.price, 0);
    
    // Group by customizations for breakdown
    const customizationGroups = new Map<string, OrderItem[]>();
    
    for (const item of nameItems) {
      const customKey = getCustomizationKey(item.customizations);
      if (!customizationGroups.has(customKey)) {
        customizationGroups.set(customKey, []);
      }
      customizationGroups.get(customKey)!.push(item);
    }

    // Create customization breakdown
    const customizationBreakdown: Array<{
      customizations: OrderItem['customizations'];
      quantity: number;
    }> = [];

    for (const [customKey, customItems] of customizationGroups) {
      customizationBreakdown.push({
        customizations: customItems[0].customizations,
        quantity: customItems.length,
      });
    }

    groupedItems.push({
      name: nameItems[0].name,
      price: nameItems[0].price,
      category: nameItems[0].category,
      quantity: nameItems.length,
      customizations: nameItems.map(item => item.customizations),
      totalPrice,
      items: nameItems,
      customizationBreakdown,
    });
    
    total += totalPrice;
  }

  return { items: groupedItems, total };
}

/**
 * Creates a consistent key for customizations to group identical ones
 */
function getCustomizationKey(customizations: OrderItem['customizations']): string {
  const parts: string[] = [];
  
  if (customizations.sauces && customizations.sauces.length > 0) {
    parts.push(`sauces:${customizations.sauces.sort().join(',')}`);
  }
  
  if (customizations.chickenType) {
    parts.push(`chicken:${customizations.chickenType}`);
  }
  
  // If no customizations, use a special key
  if (parts.length === 0) {
    return 'no-customizations';
  }
  
  return parts.sort().join('|');
}

/**
 * Formats customizations for display, handling multiple sets
 */
export function formatCustomizationsForDisplay(customizations: OrderItem['customizations'][]): string[] {
  if (customizations.length === 0) return [];
  
  // If all customizations are identical, show once
  const first = customizations[0];
  const allIdentical = customizations.every(custom => 
    JSON.stringify(custom) === JSON.stringify(first)
  );
  
  if (allIdentical) {
    return [formatSingleCustomization(first)];
  }
  
  // Different customizations, format each one
  return customizations.map(custom => formatSingleCustomization(custom));
}

/**
 * Formats a single customization object for display
 */
function formatSingleCustomization(customizations: OrderItem['customizations']): string {
  const parts: string[] = [];
  
  if (customizations.sauces && customizations.sauces.length > 0) {
    const sauceLabels: Record<string, string> = {
      'com-picante': 'Com Picante',
      'sem-picante': 'Sem Picante',
      'picante-sem-alho': 'Picante sem Alho',
      'molho-da-guia': 'Molho da Guia',
      'muito-molho': 'Muito Molho',
    };
    const formattedSauces = customizations.sauces.map(sauce => 
      sauceLabels[sauce] || sauce
    ).join(', ');
    parts.push(formattedSauces);
  }
  
  if (customizations.chickenType) {
    const chickenLabels: Record<string, string> = {
      'lourinho': 'Lourinho',
      'bem-passado': 'Bem Passado',
    };
    parts.push(chickenLabels[customizations.chickenType] || customizations.chickenType);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Sem personalizações';
}
