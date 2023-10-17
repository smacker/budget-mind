import { currencyFormatter } from '../formatters';

export function Amount({ amount, color }: { amount: number; color?: string }) {
  return (
    <span style={{ color }}>{currencyFormatter.format(amount / 100)}</span>
  );
}
