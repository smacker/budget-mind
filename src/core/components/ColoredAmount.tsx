import { useTheme } from '@mui/material/styles';
import { Amount } from './Amount';

export function ColoredAmount({ amount }: { amount: number }) {
  const theme = useTheme();

  let color;
  if (amount < 0) {
    color = theme.palette.amount.negative;
  } else if (amount > 0) {
    color = theme.palette.amount.positive;
  }
  return <Amount amount={amount} textColor={color} />;
}
