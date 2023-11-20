import { Amount, AmountProps } from './Amount';

export function SteppedAmount({
  amount,
  target,
  ...rest
}: {
  amount: number;
  target?: number;
} & AmountProps) {
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

  return <Amount amount={amount} textColor={color} {...rest} />;
}
