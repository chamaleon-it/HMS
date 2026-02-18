export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  pharmacy?: {
    general?: {
      owner?: string;
      gstin?: string;
    };
    billing?: {
      prefix: string;
      defaultGst: number;
      roundOff: boolean;
      autoPrintAfterSave: boolean;
      autoGenerateBill: boolean;
      autoGeneratePrescription?: boolean;
    };
    inventory?: {
      lowStockThreshold: number;
      expiryAlert: number;
      allowNegativeStock: boolean;
    };
    notifications?: {
      whatsapp: boolean;
      sms: boolean;
      inApp: boolean;
      note: string;
    };
  };
}
