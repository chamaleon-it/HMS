export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  lab: {
    general?: {
      owner?: string;
      gstin?: string;
    };
    catalogue: {
      showProfilesOnPatientBill: boolean;
      allowEditingPanelComposition: boolean;
    }
    tests: {
      _id: string;
      code: string;
      name: string;
      type: 'Lab' | 'Imaging' | '';
      panel: string;
      min?: number;
      max?: number;
      unit: string;
      estimatedTime: number;
    }[],
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
    reportLayout?: "Classic" | "Modern";
    panelPerPage?: boolean;
  };
}
