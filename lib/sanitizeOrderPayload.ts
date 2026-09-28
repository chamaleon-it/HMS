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
    items: (payload.items || []).map((item: any) => ({
      name: typeof item.name === "object" ? item.name?._id : item.name,
      dosage: item.dosage,
      frequency: item.frequency,
      food: item.food,
      duration: item.duration,
      quantity: item.quantity,
      batchNumber: item.batchNumber,
      unitPrice: item.unitPrice,
      mrp: item.mrp,
      gst: item.gst,
      purchasePrice: item.purchasePrice,
    })),
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
    paidAmount: payload.paidAmount,
    paymentStatus: payload.paymentStatus,
    billNo: payload.billNo,
    priority: payload.priority,
    status: payload.status,
    assignedTo: payload.assignedTo,
    items: (payload.items || []).map((item: any) => {
      const nameId =
        typeof item.name === "object" ? item.name?._id : item.name;
      return {
        name: nameId ? { _id: nameId } : undefined,
        dosage: item.dosage,
        frequency: item.frequency,
        food: item.food,
        duration: item.duration,
        quantity: item.quantity,
        batchNumber: item.batchNumber,
        unitPrice: item.unitPrice,
        mrp: item.mrp,
        gst: item.gst,
        purchasePrice: item.purchasePrice,
      };
    }),
  };
}
