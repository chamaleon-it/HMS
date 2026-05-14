
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
  range: {
    name: string;
    min: number | null | undefined;
    max: number | null | undefined;
    fromAge: number | null | undefined;
    toAge: number | null | undefined;
    gender: "Both" | "Male" | "Female";
    dateType: "Year" | "Month" | "Day";

  }[],
  note: string
  unit: string;
  panels: string[];
}
