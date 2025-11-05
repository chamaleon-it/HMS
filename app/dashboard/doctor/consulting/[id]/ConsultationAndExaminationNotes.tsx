import React, {  useMemo } from "react";
import { DataType } from "./interface";
import ExaminationNote from "./ExaminationNote";
import useSWR from "swr";
import { Consultations } from "./History";

import ConsultationNotes from "./ConsultationNotes";

export default function ConsultationAndExaminationNotes({
  data,
  setData,
  patientId,
}: {
  data: DataType;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  patientId: string;
}) {
  const { data: consultingData } = useSWR<{
    message: string;
    data: Consultations[];
  }>(`/consultings/patient/${patientId}`);

  const consulting = useMemo(
    () => consultingData?.data ?? [],
    [consultingData]
  );


  return (
    <div className=" space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConsultationNotes
          data={data}
          setData={setData}
          consulting={consulting}
        />

        <ExaminationNote data={data} setData={setData} />
      </div>
    </div>
  );
}
