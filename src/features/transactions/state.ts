import { atom, computed, action } from 'nanostores';
import {
  Transaction,
  BudgetTransaction,
  NewTransaction,
  NewTransfer,
} from '../../core/models';

// Public (to be used by other components) state

export const $transactions = atom<Transaction[]>([]);

export const $budgetTransactions = atom<BudgetTransaction[]>([]);

export const $showAddTransactionPopup = atom<false | Partial<NewTransaction>>(
  false
);

export const $showMakeTransferPopup = atom<false | Partial<NewTransfer>>(false);

export const addTransaction = action(
  $transactions,
  'addTransaction',
  async (store, transaction: Transaction): Promise<void> => {
    store.set([...store.get(), transaction]);
  }
);

export const addBudgetTransaction = action(
  $budgetTransactions,
  'addBudgetTransaction',
  async (store, tx: BudgetTransaction): Promise<void> => {
    store.set([...store.get(), tx]);
  }
);

// State scoped for the feature itself

export const dateFields = ['date'] as const;
export type DateField = (typeof dateFields)[number];

export const stringFields = ['account', 'category', 'memo'] as const;
export type StringField = (typeof stringFields)[number];

export const numberFields = ['amount'] as const;
export type NumberField = (typeof numberFields)[number];
export type Field = DateField | StringField | NumberField;

export const dateOperators = ['is', 'before', 'after'] as const;
export type DateOperator = (typeof dateOperators)[number];

export const stringOperators = ['is', 'contains'] as const;
export type StringOperator = (typeof stringOperators)[number];

export const multiStringOperators = ['one of'] as const;
export type MultiStringOperator = (typeof multiStringOperators)[number];

export const numberOperators = ['is', 'less than', 'greater than'] as const;
export type NumberOperator = (typeof numberOperators)[number];

export type Operator =
  | DateOperator
  | StringOperator
  | MultiStringOperator
  | NumberOperator;

export type DateCondition = {
  field: DateField;
  operator: DateOperator;
  value: Date;
};

export type StringCondition = {
  field: StringField;
  operator: StringOperator;
  value: string;
};

export type MultiStringCondition = {
  field: StringField;
  operator: MultiStringOperator;
  value: string[];
};

export type NumberCondition = {
  field: NumberField;
  operator: NumberOperator;
  value: number;
};

export type Condition =
  | DateCondition
  | StringCondition
  | MultiStringCondition
  | NumberCondition;

export const $conditions = atom<Condition[]>([]);

export const addCondition = action(
  $conditions,
  'add',
  (store, value: Condition) => {
    store.set([...store.get(), value]);
    return store.get();
  }
);

export const removeCondition = action($conditions, 'remove', (store, index) => {
  store.set([...store.get().slice(0, index), ...store.get().slice(index + 1)]);
  return store.get();
});

export interface TransactionTableItem extends Transaction {
  outflow?: number;
  inflow?: number;
}

export const $processedTransactions = computed(
  [$transactions, $conditions],
  (transactions, conditions) => {
    transactions = transactions
      .filter((transaction) => {
        for (const condition of conditions) {
          const { operator } = condition;
          switch (operator) {
            case 'is': {
              let txValue = transaction[condition.field];
              let condValue = condition.value;
              if (txValue instanceof Date) {
                txValue = txValue.getTime();
              }
              if (condValue instanceof Date) {
                condValue = condValue.getTime();
              }
              if (typeof condValue === 'number') {
                condValue *= 100;
              }
              if (txValue !== condValue) return false;
              break;
            }
            case 'contains':
              if (
                !transaction[condition.field]
                  .toLowerCase()
                  .includes(condition.value.toLowerCase())
              )
                return false;
              break;
            case 'one of':
              if (!condition.value.includes(transaction[condition.field]))
                return false;
              break;
            case 'before':
              if (transaction[condition.field] >= condition.value) return false;
              break;
            case 'less than':
              if (transaction[condition.field] >= condition.value * 100)
                return false;
              break;
            case 'after':
              if (transaction[condition.field] <= condition.value) return false;
              break;
            case 'greater than':
              if (transaction[condition.field] <= condition.value * 100)
                return false;
              break;
            default: {
              const _: never = operator;
              break;
            }
          }
        }
        return true;
      })
      .map((transaction) => ({
        ...transaction,
        outflow: transaction.amount < 0 ? transaction.amount : undefined,
        inflow: transaction.amount > 0 ? transaction.amount : undefined,
      }));

    transactions.sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });

    return transactions;
  }
);
