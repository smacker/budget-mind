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
