export interface BillingRecord {
  _id: string;
  user: string;
  patient: {
    _id: string;
    name: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string | null;
    address: string;
    mrn: string;
    allergies?: string;
    blood?: string;
    email?: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    gst: number;
    discount: number;
    total: number;
  }[];
  cash: number;
  online: number;
  insurance: number;
  discount: number;
  mrn: string;
  roundOff: boolean;
  transactionType: "Sale" | "Return";
  createdAt: string;
  updatedAt: string;
}

export interface CustomerType {
  data: BillingRecord[];
  message: string;
}

export interface Data {
  patient: Patient;
  orders: Order[];
  totalVisit: number;
  averageSpend: number;
  totalSpend: number;
  lastPurchase: Date;
  totalPaid: number;
  totalDue: number;
}

export interface Order {
  _id: string;
  mrn: string;
  patient: string;
  doctor: string;
  items: Item[];
  priority: string;
  status: string;
  discount?: number
  assignedTo: null;
  createdAt: Date;
  updatedAt: Date;
  paidAmount?: number;
  type?: string
  billNo?: string
}

export interface Item {
  name: Name;
  dosage: string;
  frequency: string;
  food: string;
  duration: string;
  quantity: number;
  isPacked: boolean;
  unitPrice?: number;
}

export interface Name {
  name: string;
  unitPrice: number;
  generic: string;
  manufacturer: string;
}

export interface Patient {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  dateOfBirth: Date;
  conditions: string[];
  blood: string;
  allergies: string;
  address: string;
  notes: string;
  createdBy: string;
  status: string;
  mrn: string;
  createdAt: Date;
  updatedAt: Date;
}
