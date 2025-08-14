import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Check, X, FileText } from 'lucide-react';

interface OrderNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNotes: string;
  onNotesChange: (notes: string) => void;
}

const commonOrderNotes = [
  'Para levar',
  'Para comer aqui',
  'Sem picante em tudo',
  'Tudo bem passado',
  'Tudo mal passado',
  'Sem sal',
  'Pouco sal',
  'Extra molho',
  'Sem cebola',
  'Sem alho',
  'À parte',
  'Bem quente',
  'Sem pimento'
];

export function OrderNotesModal({ 
  isOpen, 
  onClose, 
  currentNotes, 
  onNotesChange
}: OrderNotesModalProps) {
  const [inputValue, setInputValue] = useState(currentNotes);

  const handleConfirm = () => {
    onNotesChange(inputValue.trim());
    onClose();
  };

  const handleQuickNote = (note: string) => {
    if (inputValue.includes(note)) {
      // Remove if already present
      setInputValue(prev => prev.replace(note, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim());
    } else {
      // Add note
      const newValue = inputValue.trim();
      setInputValue(newValue ? `${newValue}, ${note}` : note);
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Observações do Pedido
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 pt-0 space-y-4">
          {/* Text Input */}
          <div>
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite observações gerais para todo o pedido..."
              className="min-h-20 text-sm resize-none"
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {inputValue.length}/200
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">Observações rápidas:</h4>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
              {commonOrderNotes.map((note) => {
                const isSelected = inputValue.includes(note);
                return (
                  <Button
                    key={note}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickNote(note)}
                    className={`h-7 px-2 text-xs whitespace-nowrap justify-start ${
                      isSelected ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    {note}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="flex-1 h-8 text-xs"
            >
              Limpar
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
            >
              <Check className="h-3 w-3 mr-1" />
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}