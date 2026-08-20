export interface TreatmentItemType {
  name: string;
  therapyId?: string;
  subTherapyId?: string;
  procedureId?: string;
  subProcedureId?: string;
  parentName?: string;
  code?: string;
  quantity: number;
  unitPrice: number;
  gst?: number;
  discount?: number;
  total: number;
}

export interface TreatmentPatientType {
  _id: string;
  name: string;
  mrn?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  address?: string;
}

export interface TreatmentDoctorType {
  _id: string;
  name: string;
  email?: string;
  specialization?: string;
  phoneNumber?: string;
}

export interface TreatmentTherapistType {
  _id: string;
  name: string;
  qualification?: string;
  designation?: string;
  inCharge?: boolean;
  phone?: string;
}

export interface TreatmentBillType {
  _id: string;
  mrn: string;
  status?: string;
  cash?: number;
  card?: number;
  upi?: number;
  discount?: number;
  total?: number;
  createdAt?: string | Date;
}

export interface TreatmentOrderType {
  _id: string;
  mrn: string;
  patient: TreatmentPatientType;
  doctor?: TreatmentDoctorType | null;
  doctorName: string;
  consulting?: string | null;
  type: 'Therapy' | 'Procedure' | 'Combined';
  category: string;
  items: TreatmentItemType[];
  therapist?: TreatmentTherapistType | string | null;
  therapistName: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';
  billingStatus: 'Unbilled' | 'Draft' | 'Billed' | 'Paid';
  prescriptionDate: string | Date;
  treatmentDate: string | Date;
  notes?: string;
  sessionNumber: number;
  parentTreatment?: TreatmentOrderType | string | null;
  isRepeated: boolean;
  bill?: TreatmentBillType | null;
  billNo: string;
  paidAmount: number;
  paymentMethod: string;
  discount: number;
  completedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TimelineDataType {
  rootTreatment: TreatmentOrderType;
  sessions: TreatmentOrderType[];
  totalSessions: number;
  completedSessions: number;
  totalSpend: number;
  patient: TreatmentPatientType | null;
  doctor: TreatmentDoctorType | null;
}
