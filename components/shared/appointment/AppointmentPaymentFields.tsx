import React, { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/fNumber";
import {
  discountFromPercent,
  discountPercent,
  roundMoney,
} from "@/lib/pharmacyReceiptLine";
import {
  AppointmentPayment,
  appointmentAmountPaid,
  resolveAppointmentPayment,
} from "@/lib/appointmentPayment";

interface Props {
  /** Selected doctor's consultation fee; 0 when unknown. */
  consultationFee: number;
  value: AppointmentPayment;
  onChange: (next: AppointmentPayment) => void;
}

/**
 * Cash, card, UPI, and discount collected at booking. Rupee and percent
 * discount edit each other, and every amount is capped by the fee the same
 * way the pharmacy order caps its payment split.
 */
export default function AppointmentPaymentFields({
  consultationFee,
  value,
  onChange,
}: Props) {
  const fee = roundMoney(consultationFee);
  const amountPaid = appointmentAmountPaid(value);
  const payable = roundMoney(fee - value.discount);
  const amountDue = roundMoney(Math.max(0, payable - amountPaid));

  const setField = (key: keyof AppointmentPayment, raw: string) => {
    onChange(resolveAppointmentPayment({ ...value, [key]: raw }, fee));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <IndianRupee className="h-4 w-4" />
        <h3 className="font-medium">Payment</h3>
        <span className="text-xs text-muted-foreground">(optional)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MoneyInput
          label="Cash (₹)"
          value={value.cash}
          onCommit={(raw) => setField("cash", raw)}
        />
        <MoneyInput
          label="Card (₹)"
          value={value.card}
          onCommit={(raw) => setField("card", raw)}
        />
        <MoneyInput
          label="UPI (₹)"
          value={value.upi}
          onCommit={(raw) => setField("upi", raw)}
        />
        <MoneyInput
          label="Discount (₹)"
          value={value.discount}
          disabled={fee <= 0}
          onCommit={(raw) => setField("discount", raw)}
        />
        <MoneyInput
          label="Discount (%)"
          value={discountPercent(value.discount, fee)}
          disabled={fee <= 0}
          onCommit={(raw) =>
            onChange(
              resolveAppointmentPayment(
                { ...value, discount: discountFromPercent(raw, fee) },
                fee,
              ),
            )
          }
        />
      </div>
      {fee > 0 && (
        <p className="text-xs text-muted-foreground">
          Consultation fee {formatINR(fee)}
          {value.discount > 0 && <> · Discount {formatINR(value.discount)}</>}
          {" · "}Paid {formatINR(amountPaid)} · Due{" "}
          <span className={amountDue > 0 ? "text-red-600" : "text-emerald-600"}>
            {formatINR(amountDue)}
          </span>
        </p>
      )}
    </div>
  );
}

function MoneyInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onCommit: (raw: string) => void;
}) {
  // Keep what the user is typing (e.g. "12.") until the clamped value differs.
  const [draft, setDraft] = useState<string | null>(null);
  const canonical = value === 0 ? "" : String(parseFloat(value.toFixed(2)));
  const shown = draft ?? canonical;

  useEffect(() => {
    if (draft == null || draft === "" || draft.endsWith(".")) return;
    if (Number(draft) !== value) setDraft(null);
  }, [draft, value]);

  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={shown}
        placeholder="0"
        className="mt-2.5"
        onFocus={() => setDraft(shown)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
          setDraft(raw);
          onCommit(raw);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      />
    </div>
  );
}
