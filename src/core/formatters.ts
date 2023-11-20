// TODO get the actual values from settings with fallback on navigator.language
export const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currencyDisplay: 'symbol',
  currency: 'USD',
}).format;

const currencyCodeFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currencyDisplay: 'code',
  currency: 'USD',
}).format;
export const currencyNumberFormat = (v: number | bigint) =>
  currencyCodeFormat(v).replace('USD', '').trim();

export const currencySymbol = '$';

export function parseCurrencyString(v: string): number {
  // use \p instead of \d to be able to parse non-arabic digits too
  const thousandSeparator = Intl.NumberFormat('en-US')
    .format(11111)
    .replace(/\p{Number}/gu, '');
  const decimalSeparator = Intl.NumberFormat('en-US')
    .format(1.1)
    .replace(/\p{Number}/gu, '');

  return parseFloat(
    v
      .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
      .replace(new RegExp('\\' + decimalSeparator), '.')
  );
}

export function parseCurrencyStringOrZero(v: string): number {
  const number = parseCurrencyString(v);
  if (isNaN(number)) {
    return 0;
  }
  return number;
}
