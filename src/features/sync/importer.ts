import {
  Account,
  Category,
  CategoryGroup,
  Transaction,
  BudgetTransaction,
} from '../../core/models';
import { $accounts, $userCategories, $categoryGroups } from '../../core/state';
import {
  $transactions,
  $budgetTransactions,
} from '../../features/transactions/state';
import { $importStatus } from './state';

export interface ImportedData {
  accounts: Account[];
  categoryGroups: CategoryGroup[];
  categories: Category[];
  transactions: Transaction[];
  budgetTransactions: BudgetTransaction[];
}

export interface Importer {
  import(): Promise<ImportedData>;
}

export async function importData(importer: Importer): Promise<void> {
  $importStatus.set('loading');

  try {
    const data = await importer.import();
    $accounts.set(data.accounts);
    $categoryGroups.set(data.categoryGroups);
    $userCategories.set(data.categories);
    $transactions.set(data.transactions);
    $budgetTransactions.set(data.budgetTransactions);
  } catch (e) {
    $importStatus.set('error');
    throw e;
  }

  $importStatus.set('success');
}
