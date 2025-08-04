import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
}

export function AmountInput({ value, onChange, currency = 'USD' }: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState(value || '0');

  const handleNumberPress = (num: string) => {
    if (displayValue === '0') {
      setDisplayValue(num);
      onChange(num);
    } else {
      const newValue = displayValue + num;
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  const handleDecimalPress = () => {
    if (!displayValue.includes('.')) {
      const newValue = displayValue + '.';
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  const handleTripleZero = () => {
    const newValue = displayValue === '0' ? '000' : displayValue + '000';
    setDisplayValue(newValue);
    onChange(newValue);
  };

  const handleBackspace = () => {
    if (displayValue.length > 1) {
      const newValue = displayValue.slice(0, -1);
      setDisplayValue(newValue);
      onChange(newValue);
    } else {
      setDisplayValue('0');
      onChange('0');
    }
  };

  const numberPadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['000', '0', '.']
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-2">Amount ({currency})</p>
        <p className="text-5xl font-light text-foreground">{displayValue}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {numberPadButtons.flat().map((button, index) => (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className="h-16 text-xl font-medium"
            onClick={() => {
              if (button === '000') {
                handleTripleZero();
              } else if (button === '.') {
                handleDecimalPress();
              } else {
                handleNumberPress(button);
              }
            }}
          >
            {button}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="lg"
          className="h-16 col-start-3"
          onClick={handleBackspace}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
