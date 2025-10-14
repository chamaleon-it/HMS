import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fDateandTime } from '@/lib/fDateAndTime'
import { Search } from 'lucide-react'
import React, { useEffect } from 'react'
import useSWR from 'swr'

export default function History({patientId}:{patientId:string}) {
  const {data:consultingData,isLoading,mutate} = useSWR<{message:string,data:Consultations[]}>(`/consultings/patient/${patientId}`)

  const consultations = consultingData?.data ?? []

  
useEffect(() => {
  
mutate()
  
}, [])



  if(isLoading){
     <div className="mt-4">
      Loading...!
     </div>
  }



  return (
    <div className="mt-4">
              <Card className="p-6">
                <div className="flex gap-2 mb-4 items-center">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search history..."
                  />
                </div>
                {consultations.map((h) => (
                  <div key={h._id} className="border rounded p-3 mb-3">
                    <div className="font-medium">
                      {fDateandTime(h.createdAt)} — Dr. {h.doctor.name}
                    </div>
                    <br />
                    <div className="text-sm"><b>Present History</b> : {h.consultationNotes.presentHistory}</div> <br />
                    <div className="text-sm"><b>Past History</b> : {h.consultationNotes.pastHistory}</div><br />
                    <div className="text-sm"><b>Diagnosis</b> : {h.consultationNotes.diagnosis}</div><br />
                    <div className="text-sm"><b>Advice</b> : {h.advice}</div>
                    
                  </div>
                ))}
              </Card>
            </div>
  )
}



export interface Consultations {
    _id:               string;
    patient:           Patient;
    appointment:       Appointment;
    doctor:            Doctor;
    consultationNotes: ConsultationNotes;
    examinationNote:   ExaminationNote;
    medicines:         Medicine[];
    advice:            string;
    followUp:          Date;
    test:              Test[];
    createdAt:         Date;
    updatedAt:         Date;
}

export interface Appointment {
    _id:           string;
    patient:       string;
    doctor:        string;
    createdBy:     string;
    method:        string;
    date:          Date;
    notes:         string;
    internalNotes: string;
    type:          string;
    status:        string;
    isPaid:        boolean;
    createdAt:     Date;
    updatedAt:     Date;
}

export interface ConsultationNotes {
    presentHistory: string;
    pastHistory:    string;
    diagnosis:      string;
    _id:            string;
}

export interface Doctor {
    _id:            string;
    name:           string;
    email:          string;
    specialization: string;
}

export interface ExaminationNote {
    hr:         string;
    bp:         string;
    spo2:       string;
    temp:       string;
    rs:         string;
    cvs:        string;
    pa:         string;
    cns:        string;
    otherNotes: string;
    _id:        string;
}

export interface Medicine {
    drug:      string;
    dosage:    string;
    frequency: string;
    food:      string;
    duration:  string;
    _id:       string;
}

export interface Patient {
    _id:         string;
    name:        string;
    phoneNumber: string;
    email:       string;
    gender:      string;
    age:         number;
    condition:   string;
    blood:       string;
    allergies:   string;
    address:     string;
    notes:       string;
    createdBy:   string;
    createdAt:   Date;
    updatedAt:   Date;
}

export interface Test {
    name:     string[];
    date:     Date;
    lab:      string;
    slot:     string;
    priority: string;
    _id:      string;
}
