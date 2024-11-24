import { PreinitializedWritableAtom } from 'nanostores';
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

function syncStore<T extends { id: string }>(
  store: PreinitializedWritableAtom<T[]>,
  remoteItems: T[]
) {
  const localItems = store.get();
  // Create a map of local items by ID for faster lookup
  const localMap = new Map(localItems.map((item) => [item.id, item]));
  // Preserve remote order but use existing local accounts where possible
  store.set(
    remoteItems.map((remoteItem) => {
      const localItem = localMap.get(remoteItem.id);
      if (!localItem) return remoteItem;

      // Update all properties of the local item with remote values
      Object.keys(remoteItem).forEach((key) => {
        localItem[key as keyof T] = remoteItem[key as keyof T];
      });

      return localItem;
    })
  );
}

export async function updateData(importer: Importer): Promise<void> {
  let data: ImportedData;
  try {
    data = await importer.import();
  } catch (e) {
    console.error(e);
    return;
  }

  syncStore($accounts, data.accounts);
  syncStore($categoryGroups, data.categoryGroups);
  syncStore($userCategories, data.categories);
  syncStore($transactions, data.transactions);
  syncStore($budgetTransactions, data.budgetTransactions);
}
