import { atom, computed } from 'nanostores';
import {
  availableToBudget,
  accountTransfer,
  balanceAdjustment,
  startingBalance,
} from '../../core/constants';
import { $categoryGroups, $userCategories, $accounts } from '../../core/state';
import {
  $transactions,
  $budgetTransactions,
} from '../../features/transactions/state';
import { startOfMonth, endOfMonth, startOfDay } from 'date-fns';

// TODO: add a timer to update
export const $today = atom<Date>(startOfDay(new Date()));

export const $selectedMonth = atom<Date>(startOfMonth(new Date()));
export const $selectedMonthLastDay = computed(
  [$selectedMonth],
  (selectedMonth) => endOfMonth(selectedMonth)
);

export interface DashboardTableItem {
  type: 'group' | 'category';
  name: string;
  budgeted: number;
  activity: number;
  available: number;
  monthlyBudget?: number;
  goal?: number;
}

export const $currentBudget = computed(
  [
    $selectedMonth,
    $selectedMonthLastDay,
    $categoryGroups,
    $userCategories,
    $transactions,
    $budgetTransactions,
  ],
  (
    selectedMonth,
    selectedMonthLastDay,
    categoryGroups,
    categories,
    transactions,
    budgetTransactions
  ) => {
    transactions = transactions.filter((tx) => tx.date <= selectedMonthLastDay);
    budgetTransactions = budgetTransactions.filter(
      (tx) => tx.date <= selectedMonthLastDay
    );

    const totalActivities = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalBudgeted = budgetTransactions.reduce((acc, tx) => {
      acc[tx.fromCategory] = (acc[tx.fromCategory] || 0) - tx.amount;
      acc[tx.toCategory] = (acc[tx.toCategory] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    transactions = transactions.filter((tx) => tx.date >= selectedMonth);

    budgetTransactions = budgetTransactions.filter(
      (tx) => tx.date >= selectedMonth
    );

    const activities = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetActivities = budgetTransactions.reduce((acc, tx) => {
      acc[tx.fromCategory] = (acc[tx.fromCategory] || 0) - tx.amount;
      acc[tx.toCategory] = (acc[tx.toCategory] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return categoryGroups.flatMap((group) => {
      const groupCategories = categories.filter(
        (category) => category.group === group.name
      );
      const items = groupCategories.map(
        (category) =>
          ({
            type: 'category',
            name: category.name,
            budgeted: budgetActivities[category.name] || 0,
            activity: activities[category.name] || 0,
            available:
              (totalBudgeted[category.name] || 0) +
              (totalActivities[category.name] || 0),
            monthlyBudget: category.monthlyBudget,
            goal: category.goal,
          } satisfies DashboardTableItem)
      );

      return [
        {
          type: 'group',
          name: group.name,
          budgeted: items.reduce((acc, item) => acc + item.budgeted, 0),
          activity: items.reduce((acc, item) => acc + item.activity, 0),
          available: items.reduce((acc, item) => acc + item.available, 0),
        } satisfies DashboardTableItem,
        ...items,
      ];
    });
  }
);

export interface AccountSummaryItem {
  name: string;
  amount: number;
  lastTransaction: Date | undefined;
}

export const $accountSummary = computed(
  [$accounts, $transactions],
  (accounts, transactions) => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (tx) => tx.account === account.name
      );
      accountTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      const lastTransaction = accountTransactions[0]?.date;
      const amount = accountTransactions.reduce(
        (acc, tx) => acc + tx.amount,
        0
      );

      return {
        name: account.name,
        amount,
        lastTransaction,
      } as AccountSummaryItem;
    });
  }
);

export const $budgetSummary = computed(
  [
    $selectedMonth,
    $selectedMonthLastDay,
    $transactions,
    $budgetTransactions,
    $accounts,
  ],
  (
    selectedMonth,
    selectedMonthLastDay,
    transactions,
    budgetTransactions,
    accounts
  ) => {
    transactions = transactions.filter((tx) => tx.date <= selectedMonthLastDay);

    const inflow = transactions
      .filter((tx) => {
        if (tx.amount <= 0) {
          return false;
        }

        if (
          tx.category === availableToBudget ||
          tx.category === startingBalance
        ) {
          return true;
        }

        if (tx.category === balanceAdjustment) {
          const account = accounts.find(
            (account) => tx.account === account.name
          );
          // not sure why we exclude hidden here,
          // it might be incorrect but Aspire works like this at the moment
          return !account?.creditCard && !account?.hidden;
        }

        return false;
      })
      .reduce((acc, tx) => acc + tx.amount, 0);

    const outflow = transactions
      .filter(
        (tx) =>
          (tx.category === availableToBudget ||
            tx.category === balanceAdjustment) &&
          tx.amount < 0
      )
      .reduce((acc, tx) => acc + tx.amount, 0);

    budgetTransactions = budgetTransactions.filter(
      (tx) => tx.date <= selectedMonthLastDay
    );

    const toAvailableToBudget = budgetTransactions
      .filter((tx) => tx.toCategory === availableToBudget)
      .reduce((acc, tx) => acc + tx.amount, 0);

    const fromAvailableToBudget = budgetTransactions
      .filter((tx) => tx.fromCategory === availableToBudget)
      .reduce((acc, tx) => acc + tx.amount, 0);

    budgetTransactions = budgetTransactions.filter(
      (tx) => tx.date >= selectedMonth
    );

    const budgeted = budgetTransactions.reduce((acc, tx) => {
      if (tx.fromCategory === availableToBudget) {
        acc += tx.amount;
      }
      return acc;
    }, 0);

    const monthTransactions = transactions.filter(
      (tx) => tx.date >= selectedMonth && tx.date <= selectedMonthLastDay
    );

    const spent = monthTransactions
      .filter((tx) => tx.amount < 0)
      .filter(
        (tx) =>
          tx.category !== accountTransfer &&
          tx.category !== startingBalance &&
          tx.category !== availableToBudget
      )
      .reduce((acc, tx) => acc + tx.amount, 0);

    const toBudget =
      inflow + toAvailableToBudget + outflow - fromAvailableToBudget;

    return { toBudget, spent, budgeted };
  }
);
