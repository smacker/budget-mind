import { Amount } from './Amount';

export function SteppedAmount({
  amount,
  target,
}: {
  amount: number;
  target?: number;
}) {
  let color;

  if (amount === 0) {
    color = 'gray';
  } else if (amount < 0) {
    color = 'red';
  } else if (target && target > 0 && amount / target < 0.3) {
    color = 'orange';
  } else if (target && target > 0 && amount / target >= 0.3) {
    color = 'green';
  }

  return <Amount amount={amount} color={color} />;
}
