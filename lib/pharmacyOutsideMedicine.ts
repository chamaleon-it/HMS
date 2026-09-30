/** Outside medicines are shown on the pharmacy order and prescription, never billed or taken from stock. */

export function isOutsideOrderLine(item: any): boolean {
  if (!item) return false;
  if (item.isCustom === true) return true;
  const name = item.name;
  if (name && typeof name === "object" && name.isCustom === true) return true;
  const id = typeof name === "string" ? name : name?._id;
  const hasInventoryId = typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
  if (hasInventoryId) return false;
  const referral = String(
    item.referralName ||
      (name && typeof name === "object" ? name.referralName || name.name : "") ||
      "",
  ).trim();
  return Boolean(referral);
}

export function outsideDrugLabel(item: any): string {
  const referral = String(item?.referralName || "").trim();
  if (referral) return referral;
  const name = item?.name;
  if (name && typeof name === "object") {
    const fromName = String(name.referralName || name.name || "").trim();
    if (fromName) return fromName;
  }
  if (typeof name === "string" && name.trim() && !/^[0-9a-fA-F]{24}$/.test(name.trim())) {
    return name.trim();
  }
  return "Outside medicine";
}

function entityId(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || "");
}

function consultationMedicineOutside(medicine: any): boolean {
  if (medicine?.isCustom === true) return true;
  const name = medicine?.name;
  const id = typeof name === "string" ? name : name?._id;
  if (typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)) return false;
  if (id && /^[0-9a-fA-F]{24}$/.test(String(id))) return false;
  return Boolean(String(medicine?.referralName || "").trim()) && medicine?.isCustom !== false;
}

function consultationOutsideLines(consulting: any) {
  return (consulting?.medicines || []).flatMap((medicine: any) => {
    if (!consultationMedicineOutside(medicine)) return [];
    const referralName = String(
      medicine.referralName ||
        (medicine.name && typeof medicine.name === "object" ? medicine.name.name : "") ||
        "",
    ).trim();
    if (!referralName) return [];
    return [
      {
        isCustom: true,
        referralName,
        name: null,
        dosage: medicine.dosage || "",
        frequency: medicine.frequency || "",
        food: medicine.food || "",
        duration: medicine.duration || "",
        quantity: Number(medicine.quantity) || 0,
      },
    ];
  });
}

function matchConsultation(consultings: any[] | null | undefined, order: any) {
  if (!consultings?.length || !order) return null;
  const orderTime = new Date(order.createdAt || 0).getTime();
  const doctorId = entityId(order.doctor);
  const ranked = consultings
    .map((consulting) => {
      const created = new Date(consulting?.createdAt || 0).getTime();
      return {
        consulting,
        distance: Math.abs(created - orderTime),
        sameDoctor:
          Boolean(doctorId) && entityId(consulting?.doctor) === doctorId,
      };
    })
    .filter((row) => Number.isFinite(row.distance));
  ranked.sort((a, b) => {
    if (a.sameDoctor !== b.sameDoctor) return a.sameDoctor ? -1 : 1;
    return a.distance - b.distance;
  });
  const best = ranked[0];
  if (!best || best.distance > 3 * 60 * 60 * 1000) return null;
  return best.consulting;
}

/** Attach outside lines and clinical advice from the visit that created this order. */
export function withConsultationLines<T extends { items?: any[]; advice?: string | null }>(
  order: T,
  consultings?: any[] | null,
): T {
  const match = matchConsultation(consultings, order);
  if (!match) return order;
  const currentAdvice = String(order.advice || "").trim();
  const advice = currentAdvice || String(match.advice || "").trim();
  const items = order.items || [];
  const present = new Set(
    items.filter((item) => isOutsideOrderLine(item)).map((item) => outsideDrugLabel(item).toLowerCase()),
  );
  const extra = consultationOutsideLines(match).filter(
    (line: { referralName: string }) => !present.has(line.referralName.toLowerCase()),
  );
  if (!extra.length && advice === currentAdvice) return order;
  return {
    ...order,
    advice: advice || order.advice,
    items: extra.length ? [...items, ...extra] : items,
  };
}
