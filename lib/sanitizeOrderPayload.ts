import { isOutsideOrderLine, outsideDrugLabel } from "@/lib/pharmacyOutsideMedicine";

function inventoryItemId(item: any): string | undefined {
  const raw = typeof item?.name === "object" ? item?.name?._id : item?.name;
  return typeof raw === "string" && /^[0-9a-fA-F]{24}$/.test(raw) ? raw : undefined;
}

/** Map pharmacy order create payload to BE CreateOrderDto shape. */
export function sanitizeOrderCreatePayload(payload: any) {
  return {
    mrn: payload.mrn,
    patient: payload.patient,
    doctor: payload.doctor || undefined,
    doctorName: payload.doctorName,
    pharmacist: payload.pharmacist,
    allergies: payload.allergies,
    discount: payload.discount,
    priority: payload.priority,
    status: payload.status,
    assignedTo: payload.assignedTo,
    advice: payload.advice,
    items: (payload.items || []).map((item: any) => {
      const outside = isOutsideOrderLine(item);
      const name = inventoryItemId(item);
      return {
        ...(outside || !name ? { isCustom: true, referralName: outsideDrugLabel(item) } : { name }),
        dosage: item.dosage,
        frequency: item.frequency,
        food: item.food,
        duration: item.duration,
        quantity: item.quantity,
        batchNumber: outside ? undefined : item.batchNumber,
        unitPrice: outside ? 0 : item.unitPrice,
        mrp: outside ? 0 : item.mrp,
        gst: outside ? 0 : item.gst,
        purchasePrice: outside ? 0 : item.purchasePrice,
      };
    }),
  };
}

/** Map pharmacy order update payload to BE UpdateOrderDto shape. */
export function sanitizeOrderUpdatePayload(payload: any) {
  return {
    _id: payload._id,
    mrn: payload.mrn,
    patient:
      typeof payload.patient === "object"
        ? payload.patient?._id
        : payload.patient,
    doctor:
      typeof payload.doctor === "object" ? payload.doctor?._id : payload.doctor,
    doctorName: payload.doctorName,
    pharmacist: payload.pharmacist,
    allergies: payload.allergies,
    discount: payload.discount,
    cash: payload.cash,
    card: payload.card,
    upi: payload.upi,
    paidAmount: payload.paidAmount,
    paymentStatus: payload.paymentStatus,
    billNo: payload.billNo,
    priority: payload.priority,
    status: payload.status,
    assignedTo: payload.assignedTo,
    advice: payload.advice,
    items: (payload.items || []).map((item: any) => {
      const outside = isOutsideOrderLine(item);
      const nameId = inventoryItemId(item);
      return {
        ...(outside || !nameId
          ? { isCustom: true, referralName: outsideDrugLabel(item) }
          : { name: { _id: nameId } }),
        dosage: item.dosage,
        frequency: item.frequency,
        food: item.food,
        duration: item.duration,
        quantity: item.quantity,
        batchNumber: outside ? undefined : item.batchNumber,
        unitPrice: outside ? 0 : item.unitPrice,
        mrp: outside ? 0 : item.mrp,
        gst: outside ? 0 : item.gst,
        purchasePrice: outside ? 0 : item.purchasePrice,
        expiryDate: outside ? undefined : item.expiryDate,
      };
    }),
  };
}
