import { task, computed, onAction } from 'nanostores';
import { importData } from './importer';
import { AspireBudget } from '../../infra/storage/aspire/client';
import { BudgetTransaction, Transaction } from '../../core/models';
import {
  $budgetTransactions,
  $transactions,
} from '../../features/transactions/state';
import { $token, logout } from './google';
import { GoogleSheetsApiError } from '../../infra/storage/aspire/gsheet-api';

async function safeImportData(client: Readonly<AspireBudget>) {
  try {
    return await importData(client);
  } catch (e) {
    if (e instanceof GoogleSheetsApiError && e.status === 401) {
      console.warn(e);
      logout();
    } else {
      console.error(e);
    }
  }
}

// Aspire client

let _aspireClient: AspireBudget | null = null;

const $aspireClient = computed($token, (token) => {
  if (!token) return null;

  if (!_aspireClient) {
    _aspireClient = new AspireBudget(
      token,
      import.meta.env.VITE_GOOGLE_SHEET_ID
    );
  } else {
    _aspireClient.setToken(token);
  }

  return _aspireClient;
});

// Auto (re)load data as soon as we got Aspire client

let prevAspireValue: Readonly<AspireBudget> | null = null;
$aspireClient.subscribe((client) => {
  if (!prevAspireValue && client) {
    task(() => safeImportData(client));
  }
  prevAspireValue = client;
});

// Auto submit new transactions to Aspire

onAction($transactions, async ({ actionName, args }): Promise<void> => {
  if (actionName === 'addTransaction') {
    const client = $aspireClient.get();
    if (!client) {
      return;
    }

    const data = args[0] as Transaction;
    return client.addTransaction(data);
  }
});

onAction($budgetTransactions, async ({ actionName, args }): Promise<void> => {
  if (actionName === 'addBudgetTransaction') {
    const client = $aspireClient.get();
    if (!client) {
      return;
    }

    const data = args[0] as BudgetTransaction;
    return client.addBudgetTransaction(data);
  }
});
