import { atom, computed, map } from 'nanostores';
import { $accounts, $userCategories } from '../../core/state';
import { $transactions } from '../transactions/state';
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { accountTransfer } from '../../core/constants';

export const $excludedCategories = atom(new Set<string>());

const $sortedTransactions = computed($transactions, (transactions) =>
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
);

export const $startDate = computed(
  $sortedTransactions,
  (transactions) => transactions[0]?.date
);
export const $endDate = computed(
  $sortedTransactions,
  (transactions) => transactions[transactions.length - 1]?.date
);

export const $selectedDateRange = map<{
  start: Date | null;
  end: Date | null;
}>({
  start: null,
  end: null,
});

export function selectAllRange() {
  $selectedDateRange.set({
    start: $startDate.get(),
    end: $endDate.get(),
  });
}

export function selectLastYearRange() {
  const end = $endDate.get();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 1);
  $selectedDateRange.set({ start, end });
}

$startDate.subscribe((date) => {
  if (date && !$selectedDateRange.get().start) {
    $selectedDateRange.setKey('start', date);
  }
});

$endDate.subscribe((date) => {
  if (date && !$selectedDateRange.get().end) {
    $selectedDateRange.setKey('end', date);
  }
});

const $clippedTransactions = computed(
  [$sortedTransactions, $selectedDateRange],
  (transactions, range) => {
    const { start, end } = range;
    if (!start || !end) {
      return transactions;
    }

    const now = new Date();
    const startDate = startOfMonth(start);
    const endDate =
      end.getFullYear() === now.getFullYear() &&
      end.getMonth() === now.getMonth()
        ? now
        : endOfMonth(end);

    return transactions.filter((tx) => {
      return tx.date >= startDate && tx.date <= endDate;
    });
  }
);

export function toggleExcludeCategory(category: string) {
  const set = $excludedCategories.get();
  if (set.has(category)) {
    set.delete(category);
  } else {
    set.add(category);
  }
  $excludedCategories.set(new Set(set));
}

export function toggleOnlyCategory(category: string) {
  const allCategories = $userCategories.get();
  const set = $excludedCategories.get();
  if (set.size === allCategories.length - 1 && !set.has(category)) {
    $excludedCategories.set(new Set());
  } else {
    $excludedCategories.set(
      new Set(allCategories.map((c) => c.name).filter((c) => c !== category))
    );
  }
}

export const $trendReport = computed(
  [$userCategories, $excludedCategories, $clippedTransactions],
  (categories, excludeCategories, transactions) => {
    if (!transactions.length) {
      return {
        xLabels: [],
        series: [],
      };
    }

    const months = eachMonthOfInterval({
      start: transactions[0].date,
      end: transactions[transactions.length - 1].date,
    });

    const series = categories.map((c) => {
      const excluded = excludeCategories.has(c.name);
      const data = excluded
        ? months.map(() => 0)
        : months.map((month) => {
            const monthTransactions = transactions.filter(
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
  [$selectedAccount, $clippedTransactions],
  (selectedAccount, transactions) => {
    const accountTransactions = transactions.filter(
      (tx) => tx.account === selectedAccount
    );
    if (!accountTransactions.length) {
      return {
        xLabels: [],
        series: [],
      };
    }

    const months = eachMonthOfInterval({
      start: accountTransactions[0].date,
      end: accountTransactions[accountTransactions.length - 1].date,
    });

    const inflow = {
      type: 'bar' as const,
      label: 'Inflow',
      id: 'inflow' as const,
      stack: 'total',
      data: months.map((month) => {
        const monthTransactions = accountTransactions.filter(
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
        const monthTransactions = accountTransactions.filter(
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
        const monthTransactions = accountTransactions.filter(
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
        const monthTransactions = accountTransactions.filter(
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

export const $spendingReport = computed(
  [$userCategories, $clippedTransactions],
  (categories, transactions) => {
    if (!transactions.length) {
      return {
        dataset: [],
      };
    }

    const dataset = categories.map((c) => {
      let data =
        transactions
          .filter((tx) => tx.category === c.name && tx.amount < 0)
          .reduce((acc, tx) => acc + tx.amount, 0) / 100;
      if (data < 0) {
        data = -data;
      }

      return { data, label: c.name };
    });

    return {
      dataset,
    };
  }
);
