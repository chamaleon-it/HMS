export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  lab?: {
    general?: {
      owner?: string;
      gstin?: string;
    };
    catalogue:{
      showProfilesOnPatientBill: boolean;
      allowEditingPanelComposition: boolean;
    }
    billing?: {
      prefix: string;
      defaultGst: number;
      roundOff: boolean;
      autoPrintAfterSave: boolean;
    };
    notifications?: {
      whatsapp: boolean;
      sms: boolean;
      inApp: boolean;
      note: string;
    };
  };
}
