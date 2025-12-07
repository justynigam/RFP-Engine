'use client';

import { Slider } from '@/components/ui/slider';
import { BidStrategy } from '@/lib/types';
import { cn } from '@/lib/utils';
import React, from 'react';
import { useState, useEffect } from 'react';


interface StrategySliderProps {
  value: BidStrategy;
  onChange: (value: BidStrategy) => void;
}

const strategies: BidStrategy[] = ['Aggressive', 'Balanced', 'Premium'];

export function StrategySlider({ value, onChange }: StrategySliderProps) {
  const [sliderValue, setSliderValue] = useState<number>(strategies.indexOf(value));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleValueChange = (newSliderValue: number[]) => {
    setSliderValue(newSliderValue[0]);
  };
  
  const handleCommit = (newSliderValue: number[]) => {
    onChange(strategies[newSliderValue[0]]);
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="grid gap-4 pt-2">
      <Slider
        defaultValue={[sliderValue]}
        max={2}
        step={1}
        onValueChange={handleValueChange}
        onValueCommit={handleCommit}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        {strategies.map((strat, index) => (
          <div key={strat} className="flex flex-col items-center">
            <span className={cn(
              "font-medium",
              index === sliderValue ? 'text-primary' : 'text-muted-foreground'
            )}>{strat}</span>
            <span className="text-xs">{['-10% Price', 'Market Rate', '+15% Price'][index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
