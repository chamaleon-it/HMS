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
  test: TestItem[];
  name?: TestItem[];
  sampleType: string;
  sampleCollectedAt: Date | null;
  testStartedAt: Date | null;
  sampleId: string | null;
  extraTime: number;
  status: string;
  isDeleted: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
  mrn: number;
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

export interface TestItem {
  name: TestMetadata;
  value: string;
  _id: string;
}

export interface TestMetadata {
  _id: string;
  code: string;
  name: string;
  price: number;
  type: Type;
  estimatedTime: number;
  dataType: string;
  min: number | null;
  max: number | null;
  womenMin: number | null;
  womenMax: number | null;
  childMin: number | null;
  childMax: number | null;
  nbMin: number | null;
  nbMax: number | null;
  unit: string | null;
  panels: any[];
}

export enum Type {
  Imaging = "Imaging",
  Lab = "Lab",
}
