import { task, computed, atom } from 'nanostores';
import { importData } from './importer';
import { AspireBudget } from '../../infra/storage/aspire/client';
import { BudgetTransaction, Transaction } from '../../core/models';
import { $isLoggedIn, $token, logout } from './google';
import {
  GoogleSheetsApiError,
  verifySpreadSheet,
} from '../../infra/storage/aspire/gsheet-api';
import { $spreadSheetId } from './state';

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

export const $spreadSheetIdIsValidating = atom(false);
export const $spreadSheetIdStatus = computed(
  [$isLoggedIn, $spreadSheetId],
  (isLoggedIn, sheetId) =>
    task(async () => {
      if (!isLoggedIn || !sheetId) {
        return 'unknown';
      }

      const token = $token.get();
      // if we logged in we must have a token
      if (!token) {
        throw new Error('No token');
      }

      let isValid = false;
      $spreadSheetIdIsValidating.set(true);
      try {
        isValid = await verifySpreadSheet(token, sheetId);
      } catch (e) {
        console.log(e);
      }
      $spreadSheetIdIsValidating.set(false);
      return isValid ? 'valid' : 'error';
    })
);

export const $aspireSpreadSheetId = computed(
  [$spreadSheetIdIsValidating, $spreadSheetIdStatus, $spreadSheetId],
  (spreadSheetIdIsValidating, spreadSheetIdStatus, spreadSheetId) => {
    if (spreadSheetIdIsValidating) return null;
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

// Submit new transactions to Aspire

export const addAspireTransaction = async (
  transaction: Transaction
): Promise<string> => {
  const client = $aspireClient.get();
  if (!client) {
    console.error({
      error: 'No client, transaction not added',
      transaction,
    });
    throw new Error('No client');
  }

  return client.addTransaction(transaction);
};

export const addAspireBudgetTransaction = async (
  transaction: BudgetTransaction
): Promise<void> => {
  const client = $aspireClient.get();
  if (!client) {
    console.error({
      error: 'No client, budget transaction not added',
      transaction,
    });
    return;
  }

  return client.addBudgetTransaction(transaction);
};

export const updateAspireTransaction = async (
  transaction: Transaction
): Promise<void> => {
  const client = $aspireClient.get();
  if (!client) {
    console.error({
      error: 'No client, transaction not updated',
      transaction,
    });
    return;
  }

  return client.updateTransaction(transaction);
};

export const deleteAspireTransaction = async (id: string): Promise<void> => {
  const client = $aspireClient.get();
  if (!client) {
    console.error({
      error: 'No client, transaction not deleted',
      id,
    });
    return;
  }

  return client.deleteTransaction(id);
};
