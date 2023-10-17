import {
  Account,
  Category,
  CategoryGroup,
  Transaction,
  BudgetTransaction,
} from '../../../core/models';
import { GoogleSheetsApi } from './gsheet-api';
import { ImportedData } from '../../../features/sync/importer';

export class AspireBudget extends GoogleSheetsApi {
  async import(): Promise<ImportedData> {
    const [accounts, tmp, transactions, budgetTransactions] = await Promise.all(
      [
        this.fetchAccounts(),
        this.fetchCategories(),
        this.fetchTransactions(),
        this.fetchCategoryTransfers(),
      ]
    );
    const [categoryGroups, categories] = tmp;

    // TODO validation
    return {
      accounts,
      categoryGroups,
      categories,
      transactions,
      budgetTransactions,
    };
  }

  async addTransaction(data: Transaction): Promise<void> {
    const inflow = data.amount >= 0;
    const body = {
      majorDimension: 'ROWS',
      values: [
        [
          this.dateToSerialNumber(data.date),
          !inflow ? -data.amount : '',
          inflow ? data.amount : '',
          data.category,
          data.account,
          data.memo,
          data.status === 'settled' ? '✅' : '🅿️',
        ],
      ],
    };

    const resp = await this.fetch(
      `/values/Transactions!B:H:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (resp.status !== 200) {
      throw new Error(`Failed to add transaction: ${resp.status}`);
    }
  }

  // TODO: add validation:
  // - without status
  // - available to budget as outflow
  protected async fetchTransactions(): Promise<Transaction[]> {
    const values = (await this.fetchValues(
      'Transactions',
      '!B9:H'
    )) as unknown[][];

    // each row looks like this
    // date         | Outflow | Inflow | Category | Account | Memo   | Status
    // serialNumber | number  | number | string   | string  | string | ✅ | 🅿️ | *️⃣
    return values
      .filter((row) => row[6] === '✅' || row[6] === '🅿️')
      .map((row) => {
        return new Transaction(
          'id',
          this.serialNumberToDate(row[0] as number),
          (row[1] ? -row[1] : row[2] || 0) as number,
          (row[3] as string) || '',
          (row[4] as string) || '',
          (row[5] as string) || '',
          row[6] === '✅' ? 'settled' : 'pending'
        );
      });
  }

  protected async fetchAccounts(): Promise<Account[]> {
    const values = (await this.fetchValues(
      'Configuration',
      '!I9:J23'
    )) as string[][];

    const accounts: Account[] = [];
    // Bank Account / Cash | Credit card
    for (const row of values) {
      if (row[0]) {
        accounts.push(new Account(row[0], row[0], false, false));
      }
      if (row[1]) {
        accounts.push(new Account(row[1], row[1], true, false));
      }
    }

    return accounts;
  }

  protected async fetchCategories(): Promise<[CategoryGroup[], Category[]]> {
    const values = (await this.fetchValues(
      'Configuration',
      '!B9:F108'
    )) as unknown[][];

    let groups: CategoryGroup[] = [];
    const categories: Category[] = [];
    let currentGroup: CategoryGroup | undefined;

    // type | name | monthly amount | goal amount | include in emergency fund calculation
    for (const row of values.filter((row) => !!row[0])) {
      const name = row[1] as string;

      switch (row[0]) {
        // Category Group
        case '✦':
          currentGroup = new CategoryGroup(name, name);
          groups.push(currentGroup);
          break;
        // Reportable Category
        case '✧':
          if (!currentGroup) {
            throw new Error('group must be defined before category');
          }
          categories.push(
            new Category(
              name,
              name,
              currentGroup.id,
              true,
              false,
              row[2] ? (row[2] as number) : undefined,
              row[3] ? (row[3] as number) : undefined
            )
          );
          break;
        // Non-reportable Category
        case '※':
          if (!currentGroup) {
            throw new Error('group must be defined before category');
          }
          categories.push(
            new Category(
              name,
              name,
              currentGroup.id,
              false,
              false,
              row[2] ? (row[2] as number) : undefined,
              row[3] ? (row[3] as number) : undefined
            )
          );
          break;
        // Credit Card Category
        case '◘':
          // just ignore
          break;
        default:
          throw new Error(`Unknown category type: ${row[0]}`);
      }
    }

    // filter out empty groups (e.g. credit card group)
    groups = groups.filter(
      (group) =>
        categories.filter((category) => category.group === group.id).length > 0
    );

    return [groups, categories];
  }

  protected async fetchCategoryTransfers(): Promise<BudgetTransaction[]> {
    const values = (await this.fetchValues(
      'Category Transfers',
      '!B8:G'
    )) as unknown[][];

    const trxs: BudgetTransaction[] = [];
    // date | amount | from category | to category | memo | *
    for (const row of values.filter((row) => row[5] !== '*️⃣')) {
      if (!row[1]) {
        continue;
      }

      const date = this.serialNumberToDate(row[0] as number);
      trxs.push(
        new BudgetTransaction(
          date,
          row[1] as number,
          row[2] as string,
          row[3] as string,
          row[4] as string
        )
      );
    }

    return trxs;
  }
}
