import { useTheme } from '@mui/material/styles';
import { Amount, AmountProps } from './Amount';

export function SteppedAmount({
  amount,
  target,
  ...rest
}: {
  amount: number;
  target?: number;
} & AmountProps) {
  const theme = useTheme();

  let color;

  if (amount === 0) {
    color = 'gray';
  } else if (amount < 0) {
    color = theme.palette.amount.negative;
  } else if (target && target > 0 && amount / target < 0.3) {
    color = theme.palette.warning.main;
  } else if (target && target > 0 && amount / target >= 0.3) {
    color = theme.palette.amount.positive;
  }

  return <Amount amount={amount} textColor={color} {...rest} />;
}
