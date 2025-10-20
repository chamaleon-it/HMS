export interface AppointmentData {
  data: AppointmentType[];
  message: string;
}

export interface AppointmentType {
  _id: string;
  patient: Patient;
  doctor: Doctor;
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
  visitCount: number;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: null;
  profilePic: string;
}

interface Patient {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  age: number;
  condition: string;
  blood: string;
  allergies: string;
  address: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
