import { Button } from './ui';

interface Props {
  value: number;
  min: number;
  step: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min, step, max, onChange }: Props) {
  const canIncrease = max === undefined || value + step <= max;
  return (
    <div className="inline-flex items-center rounded-md border border-slate-300 bg-white">
      <Button
        type="button"
        variant="ghost"
        className="rounded-r-none px-3"
        aria-label="Decrease quantity"
        disabled={value - step < min}
        onClick={() => onChange(value - step)}
      >
        −
      </Button>
      <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        className="rounded-l-none px-3"
        aria-label="Increase quantity"
        disabled={!canIncrease}
        onClick={() => onChange(value + step)}
      >
        +
      </Button>
    </div>
  );
}
