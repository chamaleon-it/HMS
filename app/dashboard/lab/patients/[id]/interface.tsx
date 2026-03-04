
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
  panels: any[];
  test: Test[];
  sampleType: string;
  sampleCollectedAt: Date;
  testStartedAt: Date;
  sampleId: string;
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
  specialization: null;
}

export interface Lab {
  _id: string;
  name: string;
}

export interface Test {
  name: Name;
  value: string;
  _id: string;
}

export interface Name {
  _id: string;
  code: string;
  name: string;
  price: number;
  type: string;
  estimatedTime: number;
  dataType: string;
  min: number;
  max: number;
  womenMin: number;
  womenMax: number;
  childMin: null;
  childMax: null;
  nbMin: null;
  nbMax: number;
  unit: string;
  panels: string[];
}
