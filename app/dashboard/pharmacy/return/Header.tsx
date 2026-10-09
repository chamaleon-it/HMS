import React from "react";
import Link from "next/link";
import PharmacyHeader from "../components/PharmacyHeader";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <PharmacyHeader
      title="Pharmacy Return"
      subtitle="Process patient returns and generate credit notes"
    >
      <Button variant="outline" asChild>
        <Link href="/dashboard/pharmacy/return/">All return bills</Link>
      </Button>
    </PharmacyHeader>
  );
}
