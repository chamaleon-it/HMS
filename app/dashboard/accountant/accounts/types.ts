export enum TransactionType {
  Income = "Income",
  Expense = "Expense",
}

export enum PaymentMethod {
  Cash = "Cash",
  Card = "Card",
  UPI = "UPI",
}

export enum SourceModule {
  Uncategorised = "Uncategorised",
  Doctor = "Doctor",
  Pharmacy = "Pharmacy",
  Lab = "Lab",
  Reception = "Reception",
}

export const PAYMENT_METHODS = ["Cash", "Card", "UPI"] as const;
export type PaymentMethodType = (typeof PAYMENT_METHODS)[number];

export const SOURCE_MODULES = [
  "Uncategorised",
  "Doctor",
  "Pharmacy",
  "Lab",
  "Reception",
] as const;
export type SourceModuleType = (typeof SOURCE_MODULES)[number];

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
  "Refund",
  "Sales Return",
  "Miscellaneous",
  "Other Expense"
] as const;

export const INCOME_CATEGORIES = [
  "Medicine Sale",
  "Consultation Fee",
  "Laboratory Income",
  "Therapy Income",
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
  paymentMethod?: PaymentMethod | string;
  sourceModule?: SourceModule | string;
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
