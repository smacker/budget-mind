import { atom } from 'nanostores';

export const $importStatus = atom<'idle' | 'loading' | 'success' | 'error'>(
  'idle'
);
