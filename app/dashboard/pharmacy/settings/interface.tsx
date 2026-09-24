export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  pharmacy?: {
    general?: {
      owner?: string;
      gstin?: string;
      slogan?: string | null;
      advertisement?: string | null;
      services?: string[];
    };
    billing?: {
      prefix: string;
      autoPrintAfterSave: boolean;
      autoGenerateBill: boolean;
      autoGeneratePrescription?: boolean;
      printDualCopies?: boolean;
      freeReconsultDays?: number;
    };
    inventory?: {
      lowStockThreshold: number;
      expiryAlert: number;
      allowNegativeStock: boolean;
    };
  };
}
