import useSWR from "swr";

export interface PrintBranding {
  slogan: string;
  advertisement: string;
  services: string[];
  printDualCopies: boolean;
  autoPrintAfterSave: boolean;
  freeReconsultDays: number;
}

interface BrandingSection {
  general?: {
    slogan?: string | null;
    advertisement?: string | null;
    services?: string[] | null;
  };
  billing?: {
    printDualCopies?: boolean;
    autoPrintAfterSave?: boolean;
    freeReconsultDays?: number;
  };
}

/**
 * Slogan / advertisement / services printed on receipts and prescriptions.
 * Pharmacy settings win when a user holds both sections.
 */
export default function usePrintBranding(): PrintBranding {
  const { data } = useSWR<{
    data: { pharmacy?: BrandingSection; lab?: BrandingSection };
  }>("/users/profile");

  const pharmacy = data?.data?.pharmacy;
  const lab = data?.data?.lab;

  const billing = pharmacy?.billing ?? lab?.billing;

  return {
    slogan: pharmacy?.general?.slogan || lab?.general?.slogan || "",
    advertisement:
      pharmacy?.general?.advertisement || lab?.general?.advertisement || "",
    services:
      pharmacy?.general?.services?.length
        ? pharmacy.general.services
        : lab?.general?.services ?? [],
    printDualCopies: billing?.printDualCopies ?? false,
    autoPrintAfterSave: billing?.autoPrintAfterSave ?? false,
    freeReconsultDays: billing?.freeReconsultDays ?? 7,
  };
}
