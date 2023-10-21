import { currencyFormat } from '../formatters';

export function Amount({
  amount,
  color,
  ...rest
}: { amount: number; color?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...rest} style={{ color, ...rest.style }}>
      {currencyFormat(amount / 100)}
    </span>
  );
}
