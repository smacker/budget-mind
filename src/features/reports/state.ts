import { atom, computed } from 'nanostores';
import { $accounts, $userCategories } from '../../core/state';
import { $transactions } from '../transactions/state';
import { eachMonthOfInterval, format } from 'date-fns';
import { accountTransfer } from '../../core/constants';

export const $excludedCategories = atom(new Set<string>());

export function toggleExcludeCategory(category: string) {
  const set = $excludedCategories.get();
  if (set.has(category)) {
    set.delete(category);
  } else {
    set.add(category);
  }
  $excludedCategories.set(new Set(set));
}

export const $trendReport = computed(
  [$userCategories, $excludedCategories, $transactions],
  (categories, excludeCategories, transactions) => {
    const sortedTransactions = transactions.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    const months = eachMonthOfInterval({
      start: sortedTransactions[0].date,
      end: sortedTransactions[sortedTransactions.length - 1].date,
    });

    const series = categories.map((c) => {
      const excluded = excludeCategories.has(c.name);
      const data = excluded
        ? months.map(() => 0)
        : months.map((month) => {
            const monthTransactions = sortedTransactions.filter(
              (tx) =>
                tx.category === c.name &&
                tx.date.getMonth() === month.getMonth() &&
                tx.date.getFullYear() === month.getFullYear() &&
                tx.amount < 0
            );
            const v =
              monthTransactions.reduce((acc, tx) => acc + tx.amount, 0) / 100;
            return v < 0 ? -v : 0;
          });

      return { data, label: c.name, id: c.name, stack: 'total', excluded };
    });

    return {
      xLabels: months.map((month) => format(month, 'MMMM yyyy')),
      series,
    };
  }
);

export const $selectedAccount = atom<string>('');
$accounts.subscribe((accounts) => {
  if ($selectedAccount.get() || !accounts.length) {
    return;
  }

  $selectedAccount.set(accounts[0].name);
});

export const $accountsReport = computed(
  [$selectedAccount, $transactions],
  (selectedAccount, transactions) => {
    const sortedTransactions = transactions
      .filter((tx) => tx.account === selectedAccount)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const months = eachMonthOfInterval({
      start: sortedTransactions[0].date,
      end: sortedTransactions[sortedTransactions.length - 1].date,
    });

    const inflow = {
      type: 'bar' as const,
      label: 'Inflow',
      id: 'inflow' as const,
      stack: 'total',
      data: months.map((month) => {
        const monthTransactions = sortedTransactions.filter(
          (tx) =>
            tx.category !== accountTransfer &&
            tx.amount > 0 &&
            tx.date.getMonth() === month.getMonth() &&
            tx.date.getFullYear() === month.getFullYear()
        );
        return monthTransactions.reduce((acc, tx) => acc + tx.amount, 0) / 100;
      }),
    };
    const outflow = {
      type: 'bar' as const,
      label: 'Outflow',
      id: 'outflow' as const,
      stack: 'total',
      data: months.map((month) => {
        const monthTransactions = sortedTransactions.filter(
          (tx) =>
            tx.category !== accountTransfer &&
            tx.amount < 0 &&
            tx.date.getMonth() === month.getMonth() &&
            tx.date.getFullYear() === month.getFullYear()
        );
        return monthTransactions.reduce((acc, tx) => acc + tx.amount, 0) / 100;
      }),
    };
    const tranferred = {
      type: 'bar' as const,
      label: 'Transferred',
      id: 'transferred' as const,
      stack: 'total',
      data: months.map((month) => {
        const monthTransactions = sortedTransactions.filter(
          (tx) =>
            tx.category === accountTransfer &&
            tx.date.getMonth() === month.getMonth() &&
            tx.date.getFullYear() === month.getFullYear()
        );
        return monthTransactions.reduce((acc, tx) => acc + tx.amount, 0) / 100;
      }),
    };
    const endBalance = {
      type: 'line' as const,
      label: 'End Balance',
      id: 'endBalance' as const,
      data: months.reduce((acc, month) => {
        const monthTransactions = sortedTransactions.filter(
          (tx) =>
            tx.date.getMonth() === month.getMonth() &&
            tx.date.getFullYear() === month.getFullYear()
        );
        const prevValue = acc[acc.length - 1] || 0;
        const v =
          prevValue +
          monthTransactions.reduce((acc, tx) => acc + tx.amount, 0) / 100;
        return acc.concat([v]);
      }, [] as number[]),
    };
    const series = [inflow, outflow, tranferred, endBalance];

    return {
      xLabels: months.map((month) => format(month, 'MMMM yyyy')),
      series,
    };
  }
);
