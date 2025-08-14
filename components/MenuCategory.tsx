import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MenuItem } from './OrderTaking';

interface MenuCategoryProps {
  category: string;
  items: MenuItem[];
  onAddItem: (item: MenuItem, customizations: { sauces?: string[]; chickenType?: string }) => void;
}

const sauceOptions = [
  { value: 'com-picante', label: 'Com Picante' },
  { value: 'sem-picante', label: 'Sem Picante' },
  { value: 'picante-sem-alho', label: 'Picante sem Alho' },
  { value: 'molho-da-guia', label: 'Molho da Guia' },
  { value: 'muito-molho', label: 'Muito Molho' },
];

const chickenOptions = [
  { value: 'lourinho', label: 'Lourinho' },
  { value: 'bem-passado', label: 'Bem Passado' },
];

export function MenuCategory({ category, items, onAddItem }: MenuCategoryProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<string>('');
  const [selectedChickenType, setSelectedChickenType] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const isChickenItem = (itemName: string) => {
    return itemName.toLowerCase().includes('frango') || itemName.toLowerCase().includes('galeto');
  };

  const isMeatItem = (itemName: string) => {
    const meatKeywords = ['frango', 'galeto', 'porco', 'vitela', 'coelho', 'costelinha', 'picanha', 'lombo', 'entrecosto'];
    return meatKeywords.some(keyword => itemName.toLowerCase().includes(keyword));
  };

  const handleItemClick = (item: MenuItem) => {
    const needsCustomization = isMeatItem(item.name);
    
    if (needsCustomization) {
      setSelectedItem(item);
      setSelectedSauce('');
      setSelectedChickenType('');
      setDialogOpen(true);
    } else {
      onAddItem(item, {});
    }
  };

  const handleAddWithCustomizations = () => {
    if (!selectedItem) return;
    
    const customizations: { sauces?: string[]; chickenType?: string } = {};
    
    if (selectedSauce) {
      customizations.sauces = [selectedSauce];
    }
    
    if (selectedChickenType) {
      customizations.chickenType = selectedChickenType;
    }
    
    onAddItem(selectedItem, customizations);
    setDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="h-full">
      <div className="mb-4">
        <h2>{category}</h2>
        <p className="text-muted-foreground text-sm">
          {items.length} itens disponíveis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleItemClick(item)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">€{item.price.toFixed(2)}</Badge>
                {isMeatItem(item.name) && (
                  <Badge variant="outline" className="text-xs">
                    Personalizar
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personalizar {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedItem && isMeatItem(selectedItem.name) && (
              <div>
                <h4 className="mb-3">Molho</h4>
                <RadioGroup value={selectedSauce} onValueChange={setSelectedSauce}>
                  {sauceOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {selectedItem && isChickenItem(selectedItem.name) && (
              <div>
                <h4 className="mb-3">Tipo de Cozedura</h4>
                <RadioGroup value={selectedChickenType} onValueChange={setSelectedChickenType}>
                  {chickenOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddWithCustomizations} className="flex-1">
                Adicionar (€{selectedItem?.price.toFixed(2)})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}