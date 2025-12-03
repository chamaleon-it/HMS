export interface DataTypes {
  message: string;
  data: Datum[];
}

export interface Datum {
  _id: string;
  patient: string;
  doctor: Doctor;
  lab: Lab;
  date: Date;
  priority: string;
  name: Name[];
  sampleType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: null | string;
}

export interface Lab {
  _id: string;
  name: string;
}

export interface Name {
  code: string;
  name: string;
  unit: string;
  min?: number;
  max?: number;
  type: Type;
  _id: string;
  value: string;
  panel?: Panel;
}

export enum Panel {
  Cbc = "CBC",
  Lft = "LFT",
}

export enum Type {
  Imaging = "Imaging",
  Lab = "Lab",
}
