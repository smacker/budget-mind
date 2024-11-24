import { currencies } from './currencies';
import { $currency, $locale } from './state';

// TODO get the actual values from settings with fallback on navigator.language
export const currencyFormat = new Intl.NumberFormat($locale.get(), {
  style: 'currency',
  currencyDisplay: 'symbol',
  currency: $currency.get(),
}).format;

const currencyCodeFormat = new Intl.NumberFormat($locale.get(), {
  style: 'currency',
  currencyDisplay: 'code',
  currency: $currency.get(),
}).format;
export const currencyNumberFormat = (v: number | bigint) =>
  currencyCodeFormat(v).replace($currency.get(), '').trim();

export const currencySymbol = currencies[$currency.get()].symbolNative;

export function parseCurrencyString(v: string): number {
  // use \p instead of \d to be able to parse non-arabic digits too
  const thousandSeparator = Intl.NumberFormat($locale.get())
    .format(11111)
    .replace(/\p{Number}/gu, '');
  const decimalSeparator = Intl.NumberFormat($locale.get())
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
