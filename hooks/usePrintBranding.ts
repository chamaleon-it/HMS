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
 * Prefer pharmacy or lab branding depending on the print surface.
 */
export default function usePrintBranding(
  prefer: "pharmacy" | "lab" = "pharmacy",
): PrintBranding {
  const { data } = useSWR<{
    data: { pharmacy?: BrandingSection; lab?: BrandingSection };
  }>("/users/profile");

  const pharmacy = data?.data?.pharmacy;
  const lab = data?.data?.lab;

  const primary = prefer === "lab" ? lab : pharmacy;
  const fallback = prefer === "lab" ? pharmacy : lab;
  const billing = primary?.billing ?? fallback?.billing;
  const general = primary?.general ?? fallback?.general;

  return {
    slogan: general?.slogan || "",
    advertisement: general?.advertisement || "",
    services: general?.services ?? [],
    printDualCopies: billing?.printDualCopies ?? false,
    autoPrintAfterSave: billing?.autoPrintAfterSave ?? false,
    freeReconsultDays: billing?.freeReconsultDays ?? 7,
  };
}
