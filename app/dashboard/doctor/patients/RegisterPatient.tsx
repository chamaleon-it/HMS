import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";
import registerPatientSchema from "@/schemas/registerPatientSchema";
import { zodResolver } from "@hookform/resolvers/zod";

import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";

export function RegisterPatient({ onClose }: { onClose: () => void }) {
  const { mutate } = useSWR("/patients");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      phoneNumber: "+91",
    },
  });

  const createPatient = handleSubmit(async (data) => {
    try {
      await toast.promise(api.post("/patients", data), {
        loading: "Patient is registering...!",
        error: ({ response }) => response.data.message,
        success: ({ data }) => data.message,
      });
      reset();
      onClose();
      mutate();
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <form className="space-y-5" onSubmit={createPatient}>
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          <h3 className="font-medium">Patient</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input placeholder="Enter patient name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs my-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>Phone</Label>
            <Input placeholder="+91" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs my-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <div>
            <Label>Email</Label>
            <Input
              placeholder="name@email.com"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs my-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label>Gender</Label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register("gender")}
            >
              <option value="">Choose gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs my-1">
                {errors.gender.message}
              </p>
            )}
          </div>
          <div>
            <Label>Age</Label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register("age")}
            >
              <option value="">Select Age</option>

              {/* 0 to 3 years — include months */}
              {Array.from({ length: 4 }).map((_, year) =>
                Array.from({ length: 12 }).map((_, month) => {
                  const label =
                    month === 0
                      ? `${year} year${year !== 1 ? "s" : ""}`
                      : `${year} year${year !== 1 ? "s" : ""} ${month} month${
                          month !== 1 ? "s" : ""
                        }`;
                  const value = (year * 12 + month) / 12;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })
              )}

              {/* 4 to 100 years — only full years */}
              {Array.from({ length: 97 }).map((_, i) => {
                const year = i + 4;
                const label = `${year} years`;
                const value = (year * 12) / 12;
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.age && (
              <p className="text-red-500 text-xs my-1">{errors.age.message}</p>
            )}
          </div>

          <div className="">
            <Label>Condition</Label>
            <Select onValueChange={(value) => setValue("condition", value)}>
              <SelectTrigger className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <SelectValue placeholder="Select patient condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-red-500 text-xs my-1">
                {errors.condition.message}
              </p>
            )}
          </div>

          <div>
            <Label>Blood Group</Label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              {...register("blood")}
            >
              <option value="">Choose Blood Group</option>
              {BLOOD_GROUPS.map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
            {errors.blood && (
              <p className="text-red-500 text-xs my-1">
                {errors.blood.message}
              </p>
            )}
          </div>

          <div>
            <Label>Allergies</Label>
            <Input placeholder="Allergies" {...register("allergies")} />
            {errors.allergies && (
              <p className="text-red-500 text-xs my-1">
                {errors.allergies.message}
              </p>
            )}
          </div>

          <div>
            <Label>Address</Label>
            <Input placeholder="Address" {...register("address")} />
            {errors.address && (
              <p className="text-red-500 text-xs my-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label>Reason / Notes</Label>
            <Textarea rows={3} placeholder="Optional" {...register("notes")} />
            {errors.notes && (
              <p className="text-red-500 text-xs my-1">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onClose} type="button">
          Close
        </Button>
        <Button type="submit">Register Patient</Button>
      </div>
    </form>
  );
}

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const CONDITIONS = [
  // 🩺 Common & General
  "Fever",
  "Cold",
  "Cough",
  "Headache",
  "Body Pain",
  "Fatigue",
  "Chills",
  "Dehydration",
  "Dizziness",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Constipation",
  "Abdominal Pain",
  "Back Pain",
  "Neck Pain",
  "Shoulder Pain",
  "Joint Pain",
  "Muscle Cramps",
  "Swelling",
  "Loss of Appetite",
  "Weight Loss",
  "Weight Gain",
  "Insomnia",
  "Snoring",
  "Weakness",

  // 👃 ENT (Ear, Nose, Throat)
  "Sore Throat",
  "Tonsillitis",
  "Ear Pain",
  "Hearing Loss",
  "Sinusitis",
  "Blocked Nose",
  "Nasal Allergy",
  "Runny Nose",
  "Voice Change",
  "Vertigo",

  // 👁️ Eye
  "Red Eyes",
  "Itchy Eyes",
  "Blurred Vision",
  "Eye Pain",
  "Watery Eyes",
  "Conjunctivitis",
  "Cataract",
  "Glaucoma",
  "Night Blindness",

  // 🫁 Respiratory
  "Asthma",
  "Bronchitis",
  "Shortness of Breath",
  "Wheezing",
  "Pneumonia",
  "Tuberculosis",
  "COPD",
  "Allergic Rhinitis",

  // ❤️ Cardiac
  "Chest Pain",
  "Palpitations",
  "High Blood Pressure (Hypertension)",
  "Low Blood Pressure (Hypotension)",
  "Heart Attack (Myocardial Infarction)",
  "Heart Failure",
  "Coronary Artery Disease",
  "Arrhythmia",
  "Stroke",

  // 🍽️ Digestive
  "Acidity / Heartburn",
  "Gastritis",
  "Peptic Ulcer",
  "GERD (Acid Reflux)",
  "Indigestion",
  "Irritable Bowel Syndrome (IBS)",
  "Liver Disease",
  "Fatty Liver",
  "Gallstones",
  "Pancreatitis",
  "Jaundice",
  "Appendicitis",
  "Ulcerative Colitis",
  "Crohn’s Disease",
  "Hernia",

  // 🧠 Neurological
  "Migraine",
  "Tension Headache",
  "Epilepsy",
  "Stroke (Cerebrovascular Accident)",
  "Parkinson’s Disease",
  "Alzheimer’s Disease",
  "Tremors",
  "Numbness / Tingling",
  "Paralysis",
  "Sleep Disorder",
  "Memory Loss",

  // 🩸 Endocrine & Metabolic
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Thyroid Disorder (Hypo/Hyper)",
  "Obesity",
  "Metabolic Syndrome",
  "Vitamin Deficiency",
  "Calcium Deficiency",
  "Cholesterol (High Lipids)",

  // 🦴 Bones & Joints
  "Arthritis",
  "Rheumatoid Arthritis",
  "Osteoarthritis",
  "Osteoporosis",
  "Gout",
  "Fracture",
  "Sprain",
  "Scoliosis",
  "Slipped Disc",

  // 💧 Kidney & Urinary
  "Urinary Tract Infection (UTI)",
  "Kidney Stones",
  "Chronic Kidney Disease",
  "Nephritis",
  "Frequent Urination",
  "Blood in Urine",
  "Incontinence",

  // 🧬 Immune / Autoimmune
  "Lupus (SLE)",
  "Psoriasis",
  "Eczema",
  "Vitiligo",
  "Allergies",
  "Autoimmune Thyroiditis",

  // 🧠 Mental Health
  "Anxiety",
  "Depression",
  "Stress",
  "Panic Attacks",
  "Bipolar Disorder",
  "Schizophrenia",
  "PTSD (Post-Traumatic Stress Disorder)",
  "Obsessive Compulsive Disorder (OCD)",

  // 👩‍⚕️ Female Health
  "Menstrual Pain",
  "Irregular Periods",
  "PCOS (Polycystic Ovary Syndrome)",
  "Menopause Symptoms",
  "Pregnancy Complications",
  "Pelvic Pain",
  "Uterine Fibroids",
  "Ovarian Cyst",
  "Endometriosis",
  "Breast Lump",
  "Breast Cancer",

  // 👨‍⚕️ Male Health
  "Erectile Dysfunction",
  "Prostate Enlargement (BPH)",
  "Prostate Cancer",
  "Low Testosterone",
  "Infertility",
  "Premature Ejaculation",

  // 🧒 Pediatric / General
  "Chickenpox",
  "Measles",
  "Mumps",
  "Whooping Cough",
  "Hand, Foot, and Mouth Disease",
  "Common Cold in Children",
  "Tonsillitis in Children",
  "Teething Pain",

  // 🧫 Infectious Diseases
  "Viral Fever",
  "Malaria",
  "Typhoid",
  "Dengue Fever",
  "Chikungunya",
  "COVID-19",
  "Hepatitis A",
  "Hepatitis B",
  "Hepatitis C",
  "HIV / AIDS",

  // 🧍 Skin & Hair
  "Acne",
  "Hair Loss / Alopecia",
  "Dandruff",
  "Fungal Infection",
  "Ringworm",
  "Skin Rash",
  "Hives",
  "Sunburn",
  "Pigmentation",
  "Melasma",

  // 🦷 Dental
  "Toothache",
  "Gum Bleeding",
  "Bad Breath",
  "Dental Cavity",
  "Mouth Ulcer",
  "Sensitive Teeth",

  // 🦠 Cancer (Major)
  "Lung Cancer",
  "Colon Cancer",
  "Liver Cancer",
  "Pancreatic Cancer",
  "Brain Tumor",
  "Leukemia",
  "Lymphoma",

  // ⚕️ Others
  "Anemia",
  "Seizure",
  "Injury",
  "Post-Surgery Recovery",
  "Allergic Reaction",
  "Poisoning",
  "Heat Stroke",
  "Sunstroke",
];
