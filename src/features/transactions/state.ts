import { atom, computed } from 'nanostores';
import {
  Transaction,
  BudgetTransaction,
  NewTransaction,
  NewTransfer,
} from '../../core/models';
import {
  addAspireBudgetTransaction,
  addAspireTransaction,
  updateAspireTransaction,
  deleteAspireTransaction,
} from '../sync/aspire';
import { currencyNumberFormat } from '../../core/formatters';
import { $router } from '../../router';

// Public (to be used by other components) state

export const $transactions = atom<Transaction[]>([]);

export const $budgetTransactions = atom<BudgetTransaction[]>([]);

export const $showAddTransactionPopup = atom<
  false | (Partial<NewTransaction> & { inflow?: boolean })
>(false);

export const $showMakeTransferPopup = atom<false | Partial<NewTransfer>>(false);

export const addTransaction = async (
  transaction: Transaction
): Promise<void> => {
  $transactions.set([...$transactions.get(), transaction]);
  const txId = await addAspireTransaction(transaction);
  $transactions.set(
    $transactions.get().map((tx) => (tx.id ? tx : { ...tx, id: txId }))
  );
};

export const updateTransaction = async (
  transaction: Transaction
): Promise<void> => {
  if (!transaction.id) {
    throw new Error('Transaction id is required');
  }

  $transactions.set(
    $transactions
      .get()
      .map((tx) => (tx.id === transaction.id ? transaction : tx))
  );
  return updateAspireTransaction(transaction);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error('Transaction id is required');
  }

  $transactions.set($transactions.get().filter((tx) => tx.id !== id));
  return deleteAspireTransaction(id);
};

export const addBudgetTransaction = async (
  tx: BudgetTransaction
): Promise<void> => {
  $budgetTransactions.set([...$budgetTransactions.get(), tx]);
  return addAspireBudgetTransaction(tx);
};

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
  type: 'date' | 'month' | 'year';
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

$router.subscribe((v) => {
  if (v?.route !== 'transactions' || !v?.search) {
    return;
  }

  const conditions: Condition[] = [];
  if (v.search.category) {
    conditions.push({
      field: 'category',
      operator: 'is',
      value: v.search.category,
    });
  }
  if (v.search.account) {
    conditions.push({
      field: 'account',
      operator: 'is',
      value: v.search.account,
    });
  }

  if (conditions.length) {
    $conditions.set(conditions);
  }
});

export const addCondition = (value: Condition) => {
  $conditions.set([...$conditions.get(), value]);
  return $conditions.get();
};

export const removeCondition = (index: number) => {
  $conditions.set([
    ...$conditions.get().slice(0, index),
    ...$conditions.get().slice(index + 1),
  ]);
  return $conditions.get();
};

export const $quickSearch = atom('');

export interface TransactionTableItem extends Transaction {
  outflow?: number;
  inflow?: number;
}

export const $processedTransactions = computed(
  [$transactions, $conditions, $quickSearch],
  (transactions, conditions) => {
    transactions = transactions
      .filter((transaction) => {
        for (const condition of conditions) {
          const { operator } = condition;
          switch (operator) {
            case 'is': {
              let txValue = transaction[condition.field];
              let condValue = condition.value;
              if (typeof condValue === 'number') {
                condValue *= 100;
              }
              // if one of the values is a date, the other should be a date too
              if (
                txValue instanceof Date &&
                condValue instanceof Date &&
                'type' in condition
              ) {
                switch (condition.type) {
                  case 'date':
                    txValue = txValue.getTime();
                    condValue = condValue.getTime();
                    break;
                  case 'month':
                    txValue = txValue.getMonth() + '/' + txValue.getFullYear();
                    condValue =
                      condValue.getMonth() + '/' + condValue.getFullYear();
                    break;
                  case 'year':
                    txValue = new Date(txValue).getFullYear();
                    condValue = new Date(condValue).getFullYear();
                    break;
                }
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
      .filter((transaction) => {
        const search = $quickSearch.get().toLowerCase();
        if (!search) return true;
        return Object.values(transaction).some((value) =>
          (typeof value === 'number'
            ? currencyNumberFormat(value / 100)
            : value.toString()
          )
            .toLowerCase()
            .includes(search)
        );
      })
      .map((transaction) => ({
        ...transaction,
        outflow: transaction.amount < 0 ? transaction.amount : undefined,
        inflow: transaction.amount > 0 ? transaction.amount : undefined,
      }));

    transactions.sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      // ids are in the format "tx-123"
      const aId = +a.id.slice(3);
      const bId = +b.id.slice(3);

      return bId - aId;
    });

    return transactions;
  }
);
