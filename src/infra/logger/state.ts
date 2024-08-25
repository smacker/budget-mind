import { logger } from '@nanostores/logger';

import {
  $accounts,
  $categoryGroups,
  $userCategories,
  $categories,
} from '../../core/state';
import {
  $today,
  $selectedMonth,
  $selectedMonthLastDay,
  $currentBudget,
  $accountSummary,
  $budgetSummary,
} from '../../features/dashboard/state';
import {
  $transactions,
  $budgetTransactions,
  $showAddTransactionPopup,
  $showMakeTransferPopup,
  $conditions,
  $processedTransactions,
} from '../../features/transactions/state';
import {
  $importStatus,
  $spreadsheets,
  $spreadSheetId,
  $spreadSheetIdStatus,
} from '../../features/sync/state';

logger({
  // Core
  Accounts: $accounts,
  CategoryGroups: $categoryGroups,
  UserCategories: $userCategories,
  Categories: $categories,
  // Dashboard
  Today: $today,
  SelectedMonth: $selectedMonth,
  SelectedMonthLastDay: $selectedMonthLastDay,
  CurrentBudget: $currentBudget,
  AccountSummary: $accountSummary,
  BudgetSummary: $budgetSummary,
  // Transactions
  Transactions: $transactions,
  BudgetTransactions: $budgetTransactions,
  ShowAddTransactionPopup: $showAddTransactionPopup,
  ShowMakeTransferPopup: $showMakeTransferPopup,
  Conditions: $conditions,
  ProcessedTransactions: $processedTransactions,
  // Sync
  ImportStatus: $importStatus,
  Spreadsheets: $spreadsheets,
  SpreadSheetId: $spreadSheetId,
  SpreadSheetIdStatus: $spreadSheetIdStatus,
});
