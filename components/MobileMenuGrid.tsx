import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { MenuItem } from './OrderTaking';

interface MobileMenuGridProps {
  category: string;
  items: MenuItem[];
  onAddItem: (item: MenuItem, customizations: { sauces?: string[]; chickenType?: string }) => void;
}

const sauceOptions = [
  { value: 'sem-picante', label: 'Sem Picante' },
  { value: 'com-picante', label: 'Com Picante' },
  { value: 'picante-sem-alho', label: 'Picante s/Alho' },
  { value: 'molho-da-guia', label: 'Molho Guia' },
  { value: 'muito-molho', label: 'Muito Molho' },
];

const chickenOptions = [
  { value: 'lourinho', label: 'Lourinho' },
  { value: 'bem-passado', label: 'Bem Passado' },
];

export function MobileMenuGrid({ category, items, onAddItem }: MobileMenuGridProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedSauces, setSelectedSauces] = useState<Record<string, string[]>>({});
  const [selectedChickenTypes, setSelectedChickenTypes] = useState<Record<string, string>>({});

  const isChickenItem = (itemName: string) => {
    return itemName.toLowerCase().includes('frango') || itemName.toLowerCase().includes('galeto');
  };

  const isMeatItem = (itemName: string) => {
    const meatKeywords = ['frango', 'galeto', 'porco', 'vitela', 'coelho', 'costelinha', 'picanha', 'lombo', 'entrecosto'];
    return meatKeywords.some(keyword => itemName.toLowerCase().includes(keyword));
  };

  const handleQuickAdd = (item: MenuItem) => {
    // Always allow direct add - no forced customization
    const customizations: { sauces?: string[]; chickenType?: string } = {};
    
    if (selectedSauces[item.id] && selectedSauces[item.id].length > 0) {
      customizations.sauces = selectedSauces[item.id];
    }
    if (selectedChickenTypes[item.id]) {
      customizations.chickenType = selectedChickenTypes[item.id];
    }
    
    onAddItem(item, customizations);
  };

  const handleSauceToggle = (itemId: string, sauce: string) => {
    setSelectedSauces(prev => {
      const currentSauces = prev[itemId] || [];
      const isSelected = currentSauces.includes(sauce);
      
      if (isSelected) {
        // Remove sauce
        return { ...prev, [itemId]: currentSauces.filter(s => s !== sauce) };
      } else {
        // Add sauce
        return { ...prev, [itemId]: [...currentSauces, sauce] };
      }
    });
  };

  const handleChickenTypeSelect = (itemId: string, chickenType: string) => {
    setSelectedChickenTypes(prev => {
      // Toggle chicken type - if same type clicked, deselect it
      const currentType = prev[itemId];
      if (currentType === chickenType) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [itemId]: chickenType };
      }
    });
  };

  const getSelectedCustomizations = (item: MenuItem) => {
    const parts = [];
    if (selectedSauces[item.id] && selectedSauces[item.id].length > 0) {
      const sauceLabels = selectedSauces[item.id].map(sauceValue => {
        const sauce = sauceOptions.find(s => s.value === sauceValue);
        return sauce ? sauce.label : sauceValue;
      });
      parts.push(sauceLabels.join(', '));
    }
    if (selectedChickenTypes[item.id]) {
      const chicken = chickenOptions.find(c => c.value === selectedChickenTypes[item.id]);
      if (chicken) parts.push(chicken.label);
    }
    return parts.join(' | ');
  };

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
        const needsCustomization = isMeatItem(item.name);
        const isExpanded = expandedItem === item.id;
        const hasCustomizations = getSelectedCustomizations(item);
        
        return (
          <Card key={item.id} className="overflow-hidden rounded-lg shadow-xs border border-border/60">
            <CardContent className="p-0">
              <div className="p-2 flex flex-col gap-2">
                <div className="min-h-[38px]">
                  <h3 className="font-medium text-[13px] leading-tight line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[11px] py-0.5 px-1.5 rounded">
                    €{item.price.toFixed(2)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {needsCustomization && (
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={(open) => setExpandedItem(open ? item.id : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-md"
                          >
                            {isExpanded ? 
                              <ChevronUp className="h-3 w-3" /> : 
                              <ChevronDown className="h-3 w-3" />
                            }
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    )}
                    <Button
                      onClick={() => handleQuickAdd(item)}
                      size="sm"
                      className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-xs rounded-md"
                      aria-label={`Adicionar ${item.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {needsCustomization && (
                <Collapsible
                  open={isExpanded}
                  onOpenChange={(open) => setExpandedItem(open ? item.id : null)}
                >
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-2 space-y-2">
                      <div>
                        <h4 className="font-medium mb-2 text-[11px]">Molhos (opcional - múltipla escolha)</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          {sauceOptions.map((sauce) => {
                            const isSelected = selectedSauces[item.id]?.includes(sauce.value) || false;
                            return (
                              <Button
                                key={sauce.value}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSauceToggle(item.id, sauce.value)}
                                className={`h-8 px-2 text-[11px] whitespace-normal leading-tight rounded-md ${
                                  isSelected ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                                }`}
                              >
                                {sauce.label}
                              </Button>
                            );
                          })}
                        </div>
                        {selectedSauces[item.id] && selectedSauces[item.id].length > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {selectedSauces[item.id].length} molho{selectedSauces[item.id].length > 1 ? 's' : ''} selecionado{selectedSauces[item.id].length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      
                      {isChickenItem(item.name) && (
                        <div>
                          <h4 className="font-medium mb-2 text-[11px]">Cozedura (opcional)</h4>
                          <div className="grid grid-cols-2 gap-1.5">
                            {chickenOptions.map((chicken) => (
                              <Button
                                key={chicken.value}
                                variant={selectedChickenTypes[item.id] === chicken.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleChickenTypeSelect(item.id, chicken.value)}
                                className={`h-8 px-2 text-[11px] rounded-md ${
                                  selectedChickenTypes[item.id] === chicken.value ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                                }`}
                              >
                                {chicken.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => handleQuickAdd(item)}
                        className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm rounded-md text-white"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}