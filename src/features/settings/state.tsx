import { atom, onMount } from 'nanostores';
import { getSpreadSheetMetadata } from '../../infra/storage/aspire/gdrive-api';
import { $token } from '../sync/google';
import { $aspireSpreadSheetId } from '../sync/aspire';

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
