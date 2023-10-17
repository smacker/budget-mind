// TODO get the actual values from settings with fallback on navigator.language
export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currencyDisplay: 'symbol',
  currency: 'USD',
});
