export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  pharmacyWholesaler?: {
    general: {
      contactPerson: string | null;
      gstin: string | null;
    };
    pricing?: {
      defaultMargin: number;
      minOrderValue: number;
      creditPeriod: number;
      allowCreditOrder: boolean;
    };
    logistics?: {
      sameDayDispatchCutOf: string;
      defaultCourier: string;
      returnWindow: number;
      allowPartialDispatch: boolean;
      autoMergeOrders: boolean;
    };
    notifications?: {
      whatsapp: boolean;
      email: boolean;
      sms: boolean;
      inApp: boolean;
      note?: string | null;
    };
  };
}
