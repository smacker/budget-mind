import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { Account, Category, CategoryGroup, NetWorthUpdate } from './models';
import { fixedCategories } from './constants';
import { getDateFormatFromLocale } from './date-formats';
import { getCurrencyFromLocale } from './currencies';

// TODO: to move those store to separate features when they are ready

export const $accounts = atom<Account[]>([]);
export const $categoryGroups = atom<CategoryGroup[]>([]);
export const $userCategories = atom<Category[]>([]);
export const $categories = computed($userCategories, (userCategories) => [
  ...userCategories,
  ...fixedCategories,
]);
export const $netWorthUpdates = atom<NetWorthUpdate[]>([]);

export const $locale = persistentAtom<string>(
  'locale',
  navigator.language || 'en-US'
);
export const $currency = persistentAtom<string>(
  'currency',
  getCurrencyFromLocale($locale.get())
);
export const $dateFormat = persistentAtom<string>(
  'date-format',
  getDateFormatFromLocale($locale.get())
);

$locale.subscribe((locale, prev) => {
  if (!prev) {
    return;
  }
  const prevCurrency = getCurrencyFromLocale(prev);
  const prevDateFormat = getDateFormatFromLocale(prev);

  if (prevCurrency === $currency.get()) {
    $currency.set(getCurrencyFromLocale(locale));
  }
  if (prevDateFormat === $dateFormat.get()) {
    $dateFormat.set(getDateFormatFromLocale(locale));
  }
});
