import { atom, computed } from 'nanostores';
import { Account, Category, CategoryGroup } from './models';
import { fixedCategories } from './constants';

// TODO: to move those store to separate features when they are ready

export const $accounts = atom<Account[]>([]);
export const $categoryGroups = atom<CategoryGroup[]>([]);
export const $userCategories = atom<Category[]>([]);
export const $categories = computed($userCategories, (userCategories) => [
  ...userCategories,
  ...fixedCategories,
]);
