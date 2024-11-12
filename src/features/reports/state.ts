import { atom, computed } from 'nanostores';
import { $userCategories } from '../../core/state';
import { $transactions } from '../transactions/state';
import { eachMonthOfInterval, format } from 'date-fns';

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
