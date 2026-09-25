export interface ProfileType {
  name: string;
  phoneNumber?: string;
  email: string;
  address?: string;
  lab: {
    general?: {
      owner?: string;
      gstin?: string;
      slogan?: string | null;
      advertisement?: string | null;
      services?: string[];
    };
    catalogue?: {
      showProfilesOnPatientBill?: boolean;
      allowEditingPanelComposition?: boolean;
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
      autoPrintAfterSave: boolean;
      printDualCopies?: boolean;
    };
    reportLayout?: "Classic" | "Modern";
    panelPerPage?: boolean;
  };
}
