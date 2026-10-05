import {
  clampOrderDiscount,
  clampPaymentSplit,
  positiveMoney,
  roundMoney,
  splitTotal,
} from "@/lib/pharmacyReceiptLine";

export interface AppointmentPayment {
  cash: number;
  card: number;
  upi: number;
  discount: number;
}

export const EMPTY_APPOINTMENT_PAYMENT: AppointmentPayment = {
  cash: 0,
  card: 0,
  upi: 0,
  discount: 0,
};

/**
 * Money collected when booking a visit. Same rule as the pharmacy order: the
 * discount never exceeds the consultation fee, and cash + card + UPI never
 * exceed the fee after discount. Empty fields count as zero. With no fee
 * known there is nothing to cap against, so the entered split is kept and
 * the discount is zero.
 */
export function resolveAppointmentPayment(
  input: Partial<Record<keyof AppointmentPayment, unknown>> | null | undefined,
  consultationFee: unknown,
): AppointmentPayment {
  const fee = roundMoney(positiveMoney(consultationFee));
  if (fee <= 0) {
    return {
      cash: roundMoney(positiveMoney(input?.cash)),
      card: roundMoney(positiveMoney(input?.card)),
      upi: roundMoney(positiveMoney(input?.upi)),
      discount: 0,
    };
  }
  const discount = clampOrderDiscount(input?.discount, fee);
  const split = clampPaymentSplit(input, roundMoney(fee - discount));
  return { ...split, discount };
}

export function appointmentAmountPaid(payment: Partial<AppointmentPayment>): number {
  return splitTotal(payment);
}

export function samePayment(a: AppointmentPayment, b: AppointmentPayment): boolean {
  return (
    a.cash === b.cash && a.card === b.card && a.upi === b.upi && a.discount === b.discount
  );
}
