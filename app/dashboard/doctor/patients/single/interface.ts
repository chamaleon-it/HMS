export interface ConsultationType {
  _id: string;
  patient: {
    _id: string;
    name: string;
    mrn: string;
    phoneNumber: string;
    email: string;
    gender: string;
    dateOfBirth: Date;
    conditions: string[];
    blood: string;
    allergies: string;
    address: string;
    notes: string;
    remarks: string;
    remarksDate: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
  appointment: {
    _id: string;
    patient: string;
    doctor: string;
    createdBy: string;
    method: string;
    date: Date;
    notes: string;
    internalNotes: string;
    type: string;
    status: string;
    isPaid: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
    specialization: string;
  };
  consultationNotes: {
    presentHistory: string;
    pastHistory: string;
    diagnosis: string;
    _id: string;
  };
  examinationNote: {
    hr: string;
    bp: string;
    spo2: string;
    temp: string;
    tempUnit: "°C" | "°F";
    rs: string;
    cvs: string;
    pa: string;
    cns: string;
    otherNotes: string;
    _id: string;
  };
  medicines: {
    name: {
      name: string
      _id: string;
    }
    dosage: string;
    frequency: string;
    food: string;
    duration: string;
    _id: string;
  }[];
  advice: string;
  followUp: Date;
  test: {
    name: {
      code: string;
      name: string;
    }[];
    date: Date;
    lab: string;
    priority: string;
    _id: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientType {
  address: string;
  dateOfBirth: Date;
  allergies: string;
  blood: string;
  conditions: string[];
  createdAt: Date;
  email: string;
  gender: string;
  name: string;
  notes: string;
  phoneNumber: string;
  _id: string;
  mrn: string;
  doctor: {
    _id: string;
    name: string;
    specialization: string;
  };
  insurance: string;
  insuranceValidity: Date;
  emergencyContactNumber: string;
  uhid: string;
  remarks: string;
  remarksDate: Date;
}
