import Button, { ButtonProps } from '@mui/material/Button';
import { currencyFormat } from '../formatters';

export type AmountProps = {
  amount: number;
  textColor?: string;
} & Omit<ButtonProps, 'children'>;

export function Amount({ amount, textColor, onClick, ...rest }: AmountProps) {
  const Element = onClick ? Button : 'span';
  return (
    <Element
      onClick={onClick}
      {...rest}
      style={{ color: textColor, ...rest.style }}
    >
      {currencyFormat(amount / 100)}
    </Element>
  );
}
