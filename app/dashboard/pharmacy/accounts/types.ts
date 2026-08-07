export enum TransactionType {
  Income = "Income",
  Expense = "Expense",
}

export const EXPENSE_CATEGORIES = [
  "Parking",
  "Doctor Expense",
  "Transportation",
  "Salary",
  "Electricity",
  "Rent",
  "Office Expense",
  "Internet",
  "Maintenance",
  "Miscellaneous",
  "Other Expense"
] as const;

export const INCOME_CATEGORIES = [
  "Medicine Sale",
  "Consultation Fee",
  "Laboratory Income",
  "Other Income",
] as const;

export type ExpenseCategoryType = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategoryType = (typeof INCOME_CATEGORIES)[number];

export interface AccountTransactionUserRef {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface AccountTransaction {
  _id: string;
  transactionId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  createdBy?: AccountTransactionUserRef | string;
  updatedBy?: AccountTransactionUserRef | string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface AccountTransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface GetAccountTransactionsResponse {
  message: string;
  data: AccountTransaction[];
  total: number;
  page: number;
  limit: number;
  summary: AccountTransactionSummary;
}
