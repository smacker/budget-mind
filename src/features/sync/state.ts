import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { fetchSpreadSheets } from '../../infra/storage/aspire/gdrive-api';

export const $importStatus = atom<'idle' | 'loading' | 'success' | 'error'>(
  'idle'
);

export type Spreadsheet = {
  id: string;
  name: string;
};

export const $spreadsheets = atom<Spreadsheet[]>([]);

export async function loadSpreadsheets(token: string) {
  const files = await fetchSpreadSheets(token);
  $spreadsheets.set(files);
}

// this is is selected by the user and might be invalid
// use $aspireSpreadSheetId instead everywhere expect sheet selector
export const $spreadSheetId = persistentAtom<string>('aspireSpreadsheetId', '');
