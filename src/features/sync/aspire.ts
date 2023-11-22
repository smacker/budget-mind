import { task, computed, onAction } from 'nanostores';
import { importData } from './importer';
import { AspireBudget } from '../../infra/storage/aspire/client';
import { BudgetTransaction, Transaction } from '../../core/models';
import {
  $budgetTransactions,
  $transactions,
} from '../../features/transactions/state';
import { $token, logout } from './google';
import {
  GoogleSheetsApiError,
  verifySpreadSheet,
} from '../../infra/storage/aspire/gsheet-api';
import { $spreadSheetId, $spreadSheetIdStatus } from './state';

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

// Spreadsheet id

// we need to reset spreadsheet status on id change and validate the new id
let prevSpreadSheetId = '';
$spreadSheetId.subscribe((id) => {
  if (prevSpreadSheetId !== id) {
    $spreadSheetIdStatus.set('validating');

    const token = $token.get();
    if (token) {
      task(async () => {
        let isValid = false;
        try {
          isValid = await verifySpreadSheet(token, id);
        } catch (e) {
          console.log(e);
        }
        if (isValid) {
          $spreadSheetIdStatus.set('valid');
        } else {
          $spreadSheetIdStatus.set('error');
        }
      });
    }
  }
  prevSpreadSheetId = id;
});

export const $aspireSpreadSheetId = computed(
  [$token, $spreadSheetIdStatus, $spreadSheetId],
  (token, spreadSheetIdStatus, spreadSheetId) => {
    if (!token) return null;
    if (spreadSheetIdStatus !== 'valid') return null;

    return spreadSheetId;
  }
);

// Aspire client

let _aspireClient: AspireBudget | null = null;

const $aspireClient = computed(
  [$token, $aspireSpreadSheetId],
  (token, aspireSpreadSheetId) => {
    if (!token || !aspireSpreadSheetId) return null;

    if (!_aspireClient) {
      _aspireClient = new AspireBudget(token, aspireSpreadSheetId);
    } else {
      _aspireClient.setToken(token);
      _aspireClient.setSpreadsheetId(aspireSpreadSheetId);
    }

    return _aspireClient;
  }
);

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
