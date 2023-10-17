import { Amount } from './Amount';

export function ColoredAmount({ amount }: { amount: number }) {
  let color;
  if (amount < 0) {
    color = 'red';
  } else if (amount > 0) {
    color = 'green';
  }
  return <Amount amount={amount} color={color} />;
}
