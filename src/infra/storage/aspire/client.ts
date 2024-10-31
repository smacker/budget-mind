import {
  Account,
  Category,
  CategoryGroup,
  Transaction,
  BudgetTransaction,
} from '../../../core/models';
import { GoogleSheetsApi } from './gsheet-api';
import { ImportedData } from '../../../features/sync/importer';

// Inside the app we use integers to represent amount everywhere
// so we need to multiple by 100 when reading the data from remote
// and divide when writing to the remote

function toInteger(v?: unknown): number {
  if (!v) {
    return 0;
  }
  const n = +v;
  if (isNaN(n)) {
    throw new Error(`${v} is not a number`);
  }
  return n * 100;
}

export class AspireBudget extends GoogleSheetsApi {
  protected lastTxIndex = 0;

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

  protected txToBody(data: Transaction) {
    const inflow = data.amount >= 0;
    return {
      majorDimension: 'ROWS',
      values: [
        [
          this.dateToSerialNumber(data.date),
          !inflow ? -data.amount / 100 : '',
          inflow ? data.amount / 100 : '',
          data.category,
          data.account,
          data.memo,
          data.status === 'settled' ? '✅' : '🅿️',
        ],
      ],
    };
  }

  async addTransaction(data: Transaction): Promise<string> {
    const body = this.txToBody(data);

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

    const json = await resp.json();
    // the value is in format 'Transactions!B4143:H4143'
    const rowNumber = json.updates.updatedRange.split(':')[1].slice(1);
    return `tx-${rowNumber}`;
  }

  async addBudgetTransaction(data: BudgetTransaction): Promise<void> {
    const body = {
      majorDimension: 'ROWS',
      values: [
        [
          this.dateToSerialNumber(data.date),
          data.amount / 100,
          data.fromCategory,
          data.toCategory,
          data.memo,
        ],
      ],
    };

    const resp = await this.fetch(
      `/values/Category Transfers!B:G:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    if (resp.status !== 200) {
      throw new Error(`Failed to add budget transaction: ${resp.status}`);
    }
  }

  async updateTransaction(data: Transaction): Promise<void> {
    const rowNumber = data.id.slice(3); // id is in format tx-<rowNumber>
    const body = this.txToBody(data);

    const resp = await this.fetch(
      `/values/Transactions!B${rowNumber}:H${rowNumber}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
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
    this.lastTxIndex = 9;

    const values = (await this.fetchValues(
      'Transactions',
      `!B${this.lastTxIndex}:H`
    )) as unknown[][];

    // each row looks like this
    // date         | Outflow | Inflow | Category | Account | Memo   | Status
    // serialNumber | number  | number | string   | string  | string | ✅ | 🅿️ | *️⃣
    return values
      .map((row) => {
        return [row, this.lastTxIndex++] as [unknown[], number];
      })
      .filter(([row]) => row[6] === '✅' || row[6] === '🅿️')
      .map(([row, idx]) => {
        if (!row[0]) {
          console.warn(`Row ${idx} doesn't have date`, row);
        }
        if (row[6] !== '*️⃣' && !row[1] && !row[2]) {
          console.warn(`Row ${idx} doesn't have amount`, row);
        }
        if (row[6] !== '*️⃣' && !row[3]) {
          console.warn(`Row ${idx} doesn't have category`, row);
        }
        if (row[6] !== '*️⃣' && !row[4]) {
          console.warn(`Row ${idx} doesn't have account`, row);
        }
        if (!row[6]) {
          console.warn(`Row ${idx} doesn't have status`, row);
        }

        return new Transaction(
          `tx-${idx}`,
          this.serialNumberToDate(row[0] as number),
          toInteger(row[1] ? -row[1] : row[2] || 0),
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
              row[2] ? toInteger(row[2]) : undefined,
              row[3] ? toInteger(row[3]) : undefined
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
              row[2] ? toInteger(row[2]) : undefined,
              row[3] ? toInteger(row[3]) : undefined
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
          toInteger(row[1]),
          row[2] as string,
          row[3] as string,
          row[4] as string
        )
      );
    }

    return trxs;
  }
}
