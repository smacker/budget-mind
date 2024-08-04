export class Account {
  constructor(
    public id: string,
    public name: string,
    public creditCard: boolean,
    public hidden: boolean
  ) {}
}

export class CategoryGroup {
  constructor(public id: string, public name: string) {}
}

export class Category {
  constructor(
    public id: string,
    public name: string,
    public group: string,
    public reportable: boolean,
    public hidden: boolean,
    public monthlyBudget?: number,
    public goal?: number
  ) {}
}

export class Transaction {
  constructor(
    public id: string,
    public date: Date,
    public amount: number,
    public category: string,
    public account: string,
    public memo: string,
    public status: 'settled' | 'pending'
  ) {}
}

export type NewTransaction = Exclude<Transaction, 'id'>;

export type NewTransfer = Exclude<Transaction, 'id' | 'status' | 'account'> & {
  fromAccount: string;
  toAccount: string;
};

export class BudgetTransaction {
  constructor(
    public date: Date,
    public amount: number,
    public fromCategory: string,
    public toCategory: string,
    public memo: string
  ) {}
}
