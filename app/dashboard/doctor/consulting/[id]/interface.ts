export interface AppointmentType {
  _id: string;
  patient: {
    _id: string;
    name: string;
    phoneNumber: string;
    email: string;
    gender: string;
    age: number;
    blood: string;
    allergies: string;
    createdAt: Date;
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
    rs: null | string;
    cvs: null | string;
    pa: null | string;
    cns: null | string;
    otherNotes: null | string;
  };
  medicines: {
    drug: string;
    dosage: string;
    frequency: string;
    food: string;
    duration: string;
  }[];
  advice: null | string;
  followUp: null | Date;
  test: {
    name: string[];
    date: Date;
    lab: string;
    slot: string;
    priority: string;
  }[];
}
