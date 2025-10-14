const LABS = [
  {
    id: "lab1",
    name: "In‑House Diagnostics",
    inhouse: true,
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  {
    id: "lab3",
    name: "Hospital Imaging Center",
    inhouse: true,
    slots: ["14:00", "14:30", "15:00", "15:30", "16:00"],
  },
  {
    id: "lab2",
    name: "Metro Diagnostics",
    inhouse: false,
    slots: ["11:00", "11:30", "12:00", "12:30", "13:00"],
  },
  {
    id: "lab4",
    name: "Dr Jossy Diagnostic Center",
    inhouse: false,
    slots: ["11:00", "11:30", "12:00", "12:30", "13:00"],
  },
];


const TESTS = [
  { id: "I033", name: "ECG", type: "image" },

  // ---------------- LAB TESTS ----------------
  {
    id: "L001",
    name: "Complete Blood Count (CBC)",
    type: "lab",
  },
  { id: "L002", name: "Hemoglobin", type: "lab" },
  {
    id: "L003",
    name: "Blood Sugar (Fasting)",
    type: "lab",
  },
  {
    id: "L004",
    name: "Blood Sugar (PP)",
    type: "lab",
  },
  { id: "L005", name: "HbA1c", type: "lab" },
  {
    id: "L006",
    name: "Lipid Profile",
    type: "lab",
  },
  { id: "L007", name: "Cholesterol", type: "lab" },
  {
    id: "L008",
    name: "Triglycerides",
    type: "lab",
  },
  { id: "L009", name: "HDL", type: "lab" },
  { id: "L010", name: "LDL", type: "lab" },
  {
    id: "L011",
    name: "Liver Function Test",
    type: "lab",
  },
  {
    id: "L012",
    name: "Kidney Function Test",
    type: "lab",
  },
  { id: "L013", name: "Creatinine", type: "lab" },
  { id: "L014", name: "Uric Acid", type: "lab" },
  { id: "L015", name: "Electrolytes", type: "lab" },
  { id: "L016", name: "Calcium", type: "lab" },
  { id: "L017", name: "Phosphorus", type: "lab" },
  { id: "L018", name: "Magnesium", type: "lab" },
  { id: "L019", name: "Iron Studies", type: "lab" },
  { id: "L020", name: "Ferritin", type: "lab" },
  { id: "L021", name: "Vitamin D", type: "lab" },
  { id: "L022", name: "Vitamin B12", type: "lab" },
  { id: "L023", name: "Folate", type: "lab" },
  {
    id: "L024",
    name: "Thyroid (TSH)",
    type: "lab",
  },
  { id: "L025", name: "T3", type: "lab" },
  { id: "L026", name: "T4", type: "lab" },
  {
    id: "L027",
    name: "Parathyroid Hormone",
    type: "lab",
  },
  { id: "L028", name: "Prolactin", type: "lab" },
  { id: "L029", name: "Testosterone", type: "lab" },
  { id: "L030", name: "Progesterone", type: "lab" },
  { id: "L031", name: "Estrogen", type: "lab" },
  {
    id: "L032",
    name: "C-Reactive Protein (CRP)",
    type: "lab",
  },
  { id: "L033", name: "ESR", type: "lab" },
  { id: "L034", name: "D-Dimer", type: "lab" },
  {
    id: "L035",
    name: "Coagulation Profile",
    type: "lab",
  },
  { id: "L036", name: "Blood Group", type: "lab" },
  {
    id: "L037",
    name: "Urine Routine",
    type: "lab",
  },
  {
    id: "L038",
    name: "Stool Routine",
    type: "lab",
  },
  { id: "L039", name: "Malaria Test", type: "lab" },
  { id: "L040", name: "Dengue Test", type: "lab" },
  {
    id: "L041",
    name: "Typhoid (Widal)",
    type: "lab",
  },
  { id: "L042", name: "HIV Test", type: "lab" },
  {
    id: "L043",
    name: "Hepatitis B Surface Antigen",
    type: "lab",
  },
  {
    id: "L044",
    name: "Hepatitis C Antibody",
    type: "lab",
  },
  {
    id: "L045",
    name: "Syphilis Test (VDRL)",
    type: "lab",
  },
  {
    id: "L046",
    name: "Covid-19 RTPCR",
    type: "lab",
  },
  {
    id: "L047",
    name: "Covid-19 Antibody",
    type: "lab",
  },
  {
    id: "L048",
    name: "Blood Culture",
    type: "lab",
  },
  {
    id: "L049",
    name: "Urine Culture",
    type: "lab",
  },
  {
    id: "L050",
    name: "Sputum Culture",
    type: "lab",
  },

  // ---------------- IMAGING TESTS ----------------
  {
    id: "I001",
    name: "X-Ray Chest",
    type: "image",
  },
  {
    id: "I002",
    name: "X-Ray Abdomen",
    type: "image",
  },
  {
    id: "I003",
    name: "X-Ray Spine",
    type: "image",
  },
  {
    id: "I004",
    name: "X-Ray Skull",
    type: "image",
  },
  {
    id: "I005",
    name: "X-Ray Pelvis",
    type: "image",
  },
  { id: "I006", name: "X-Ray Hand", type: "image" },
  { id: "I007", name: "X-Ray Foot", type: "image" },
  {
    id: "I008",
    name: "X-Ray Shoulder",
    type: "image",
  },
  { id: "I009", name: "X-Ray Knee", type: "image" },
  {
    id: "I010",
    name: "Ultrasound Abdomen",
    type: "image",
  },
  {
    id: "I011",
    name: "Ultrasound Pelvis",
    type: "image",
  },
  {
    id: "I012",
    name: "Ultrasound Neck",
    type: "image",
  },
  {
    id: "I013",
    name: "Ultrasound Breast",
    type: "image",
  },
  {
    id: "I014",
    name: "Ultrasound Pregnancy",
    type: "image",
  },
  {
    id: "I015",
    name: "CT Scan Brain",
    type: "image",
  },
  {
    id: "I016",
    name: "CT Scan Chest",
    type: "image",
  },
  {
    id: "I017",
    name: "CT Scan Abdomen",
    type: "image",
  },
  {
    id: "I018",
    name: "CT Scan Pelvis",
    type: "image",
  },
  {
    id: "I019",
    name: "CT Angiography",
    type: "image",
  },
  {
    id: "I020",
    name: "CT Coronary",
    type: "image",
  },
  { id: "I021", name: "MRI Brain", type: "image" },
  { id: "I022", name: "MRI Spine", type: "image" },
  { id: "I023", name: "MRI Knee", type: "image" },
  {
    id: "I024",
    name: "MRI Shoulder",
    type: "image",
  },
  {
    id: "I025",
    name: "MRI Abdomen",
    type: "image",
  },
  { id: "I026", name: "MRI Pelvis", type: "image" },
  { id: "I027", name: "PET Scan", type: "image" },
  { id: "I028", name: "Bone Scan", type: "image" },
  {
    id: "I029",
    name: "Thyroid Scan",
    type: "image",
  },
  { id: "I030", name: "Renal Scan", type: "image" },
  {
    id: "I031",
    name: "Mammography",
    type: "image",
  },
  {
    id: "I032",
    name: "Echocardiography",
    type: "image",
  },

  { id: "I034", name: "EEG", type: "image" },
  { id: "I035", name: "EMG", type: "image" },
  {
    id: "I036",
    name: "Holter Monitoring",
    type: "image",
  },
  {
    id: "I037",
    name: "Stress Test (TMT)",
    type: "image",
  },
  {
    id: "I038",
    name: "Angiography",
    type: "image",
  },
  { id: "I039", name: "Venography", type: "image" },
  {
    id: "I040",
    name: "Myelography",
    type: "image",
  },
  {
    id: "I041",
    name: "Fluoroscopy",
    type: "image",
  },
  {
    id: "I042",
    name: "Bone Density (DEXA)",
    type: "image",
  },
  {
    id: "I043",
    name: "Dental X-Ray (OPG)",
    type: "image",
  },
  {
    id: "I044",
    name: "Sinus X-Ray",
    type: "image",
  },
  {
    id: "I045",
    name: "Contrast CT",
    type: "image",
  },
  {
    id: "I046",
    name: "Contrast MRI",
    type: "image",
  },
  {
    id: "I047",
    name: "3D CT Reconstruction",
    type: "image",
  },
  {
    id: "I048",
    name: "Cardiac MRI",
    type: "image",
  },
  {
    id: "I049",
    name: "Virtual Colonoscopy",
    type: "image",
  },
  {
    id: "I050",
    name: "Endoscopic Ultrasound (EUS)",
    type: "image",
  },
]


export {LABS,TESTS}