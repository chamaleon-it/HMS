export interface AppointmentType {
  _id: string;
  patient: {
    _id: string;
    name: string;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: Date;
    blood: string;
    allergies: string;
    createdAt: Date;
    mrn: string;
  };

  doctor: string;
  createdBy: string;
  method: string;
  date: Date;
  notes: string;
  internalNotes: string;
  type: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
}

export interface DataType {
  patient: null | string;
  appointment: null | string;
  consultationNotes: {
    presentHistory: null | string;
    pastHistory: null | string;
    diagnosis: null | string;
  };
  examinationNote: {
    hr: null | string;
    bp: null | string;
    spo2: null | string;
    temp: null | string;
    tempUnit: "°C" | "°F";
    rs: null | string;
    cvs: null | string;
    pa: null | string;
    cns: null | string;
    le: null | string;
    otherNotes: null | string;
  };
  medicines: {
    referralName: string;
    name: string;
    dosage: string;
    frequency: string;
    food: string;
    duration: string;
    quantity: number;
  }[];
  advice: null | string;
  followUp: null | Date;
  test: {
    name: {
      code: string;
      max?: number;
      min?: number;
      name: string;
      type: "Lab" | "Imaging";
      unit: string;
      _id: string;
    }[];
    date: Date;
    lab: string;
    priority: string;
  }[];
}
