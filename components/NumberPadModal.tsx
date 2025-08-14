import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Delete, Check } from 'lucide-react';

interface NumberPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNumber: number;
  onNumberChange: (number: number) => void;
  existingNumbers: number[];
}

export function NumberPadModal({ 
  isOpen, 
  onClose, 
  currentNumber, 
  onNumberChange, 
  existingNumbers 
}: NumberPadModalProps) {
  const [inputValue, setInputValue] = useState(currentNumber.toString());

  const handleNumberPress = (digit: string) => {
    if (inputValue === '0') {
      setInputValue(digit);
    } else if (inputValue.length < 3) {
      setInputValue(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (inputValue.length === 1) {
      setInputValue('0');
    } else {
      setInputValue(prev => prev.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    const number = parseInt(inputValue);
    if (number > 0) {
      onNumberChange(number);
      onClose();
    }
  };

  const handleClear = () => {
    setInputValue('0');
  };

  const currentInputNumber = parseInt(inputValue);
  const isNumberTaken = existingNumbers.includes(currentInputNumber);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-center">Número da Senha</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 pt-0">
          {/* Display */}
          <div className="text-center mb-4">
            <div className={`text-4xl font-mono font-bold py-4 px-6 rounded-lg border-2 ${
              isNumberTaken ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300 bg-gray-50'
            }`}>
              {inputValue}
            </div>
            {isNumberTaken && (
              <Badge variant="destructive" className="mt-2">
                Número já usado
              </Badge>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                variant="outline"
                onClick={() => handleNumberPress(digit.toString())}
                className="h-12 text-lg font-medium"
              >
                {digit}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-12 text-sm"
            >
              Limpar
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleNumberPress('0')}
              className="h-12 text-lg font-medium"
            >
              0
            </Button>
            
            <Button
              variant="outline"
              onClick={handleBackspace}
              className="h-12"
            >
              <Delete className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-10"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isNumberTaken || currentInputNumber === 0}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              <Check className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}