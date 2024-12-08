import { atom, onMount } from 'nanostores';
import { getSpreadSheetMetadata } from '../../infra/storage/aspire/gdrive-api';
import { $token } from '../sync/google';
import { $aspireSpreadSheetId } from '../sync/aspire';
import {
  $accounts,
  $categories,
  $categoryGroups,
  $netWorthUpdates,
} from '../../core/state';
import { $budgetTransactions, $transactions } from '../transactions/state';
import { format } from 'date-fns';

export const $spreadSheetInfo = atom<
  { id: string; name: string } | undefined
>();

onMount($spreadSheetInfo, () => {
  loadSpreadSheetInfo();
});

export async function loadSpreadSheetInfo() {
  const token = $token.get();
  const id = $aspireSpreadSheetId.get();
  if (!token || !id) {
    return;
  }

  const info = await getSpreadSheetMetadata(id, token);
  $spreadSheetInfo.set(info);
}

export function dataExport() {
  const data = JSON.stringify({
    accounts: $accounts.get().map((account) => ({
      id: account.id,
      name: account.name,
      type: account.creditCard ? 'credit' : 'checking',
      closed: account.hidden,
    })),
    categoryGroups: $categoryGroups.get().map((group) => ({
      id: group.id,
      name: group.name,
    })),
    categories: $categories.get().map((category) => ({
      id: category.id,
      name: category.name,
      groupName: category.group,
    })),
    transactions: $transactions.get().map((tx) => ({
      id: tx.id,
      account: tx.account,
      date: format(tx.date, 'yyyy-MM-dd'),
      amount: tx.amount,
      category: tx.category,
      notes: tx.memo,
      cleared: tx.status === 'settled', // ensure no "undefined" values
    })),
    budgetTransactions: $budgetTransactions.get().map((tx) => ({
      id: tx.id,
      date: format(tx.date, 'yyyy-MM-dd'),
      amount: tx.amount,
      from_category: tx.fromCategory,
      to_category: tx.toCategory,
    })),
    netWorthUpdates: $netWorthUpdates.get().map((update) => ({
      id: update.id,
      date: format(update.date, 'yyyy-MM-dd'),
      amount: update.amount,
      category: update.category,
      notes: update.notes,
    })),
  });
  const blob = new Blob([data], { type: 'application/json' });

  // Create a temporary link to download the Blob
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'budget-export.json'; // Specify the file name

  // Append the link to the body (optional but required in some browsers)
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up: remove the link from the DOM
  document.body.removeChild(link);
}
