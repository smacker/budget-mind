import { Category } from './models';

export const availableToBudget = 'Available to budget';
export const accountTransfer = '↕️ Account Transfer';
export const balanceAdjustment = '🔢 Balance Adjustment';
export const startingBalance = '➡️ Starting Balance';

export const fixedCategories: Category[] = [
  {
    id: '',
    name: availableToBudget,
    group: 'Preset',
    reportable: false,
    hidden: false,
  },
  {
    id: '',
    name: accountTransfer,
    group: 'Preset',
    reportable: false,
    hidden: false,
  },
  {
    id: '',
    name: balanceAdjustment,
    group: 'Preset',
    reportable: false,
    hidden: false,
  },
  {
    id: '',
    name: startingBalance,
    group: 'Preset',
    reportable: false,
    hidden: false,
  },
];
