import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Trash2 } from 'lucide-react';
import { OrderItem } from '../App';

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
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const formatCustomizations = (customizations: OrderItem['customizations']) => {
    const parts = [];
    
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
    
    return parts.length > 0 ? parts.join(' | ') : null;
  };

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
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-start justify-between gap-2 pb-3 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {item.name}
                      </p>
                      {formatCustomizations(item.customizations) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCustomizations(item.customizations)}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-2 text-xs">
                        €{item.price.toFixed(2)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
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