// Seed copy of yes-hospital/src/lib/data.ts (2026-11-17), data only. Read by seed/yes-hospital/seed.ts.

export type Department = {
  id: string;
  name: string;
  icon: string;
  description: string;
  doctors: number;
  shortName?: string;
  blurb?: string;
  symptoms: string[];
  conditions?: string[];
  procedures?: string[];
  faqs?: { q: string; a: string }[];
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  languages: string[];
  photo?: string;
  opd?: string;
};

export const doctors: Doctor[] = [
  // Medicine, Pulmonology & Critical Care
  {
    id: "dr-rajesh-baghe",
    name: "Dr. Rajesh Baghe",
    photo: "/images/doctors/dr-rajesh-baghe.jpg",
    specialty: "Medicine, Pulmonology & Critical Care",
    qualification: "MBBS, MD (Medicine)",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-ravi-yadav",
    name: "Dr. Ravi Yadav",
    photo: "/images/doctors/dr-ravi-yadav.jpg",
    specialty: "Medicine, Pulmonology & Critical Care",
    qualification: "MBBS, DTCD, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  // General & Minimal Invasive Surgery
  {
    id: "dr-pramey-dhage",
    name: "Dr. Pramey Dhage",
    photo: "/images/doctors/dr-pramey-dhage.jpg",
    specialty: "General & Minimal Invasive Surgery",
    qualification: "MS, F.MAS, D.MAS",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-avinash-rinait",
    name: "Dr. Avinash Rinait",
    specialty: "General & Minimal Invasive Surgery",
    qualification: "MBBS, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-hemant-bhanarkar",
    name: "Dr. Hemant Bhanarkar",
    specialty: "General & Minimal Invasive Surgery",
    qualification: "MBBS, MS",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Interventional Cardiology
  {
    id: "dr-rupesh-agrawal",
    name: "Dr. Rupesh Agrawal",
    specialty: "Interventional Cardiology",
    qualification: "MBBS, MD, DM",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-snehal-rangari",
    name: "Dr. Snehal Rangari",
    specialty: "Interventional Cardiology",
    qualification: "MBBS, MD, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Orthopaedic, Trauma & Spine Surgery
  {
    id: "dr-kuber-sakhare",
    name: "Dr. Kuber Sakhare",
    photo: "/images/doctors/dr-kuber-sakhare.jpg",
    specialty: "Orthopaedic, Trauma & Spine Surgery",
    qualification: "MBBS, MS (Ortho)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Gynaecology & Obstetrics
  {
    id: "dr-kriti-sahu",
    name: "Dr. Kriti Sahu",
    photo: "/images/doctors/dr-kriti-sahu.jpg",
    specialty: "Gynaecology & Obstetrics",
    qualification: "MBBS, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-prerna-vaidya",
    name: "Dr. Prerna Vaidya",
    photo: "/images/doctors/dr-prerna-vaidya.jpg",
    specialty: "Gynaecology & Obstetrics",
    qualification: "MBBS, DGO",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Paediatrics
  {
    id: "dr-sandeep-manwatkar",
    name: "Dr. Sandeep Manwatkar",
    photo: "/images/doctors/dr-sandeep-manwatkar.jpg",
    specialty: "Paediatrics",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-harihar-lambat",
    name: "Dr. Harihar Lambat",
    specialty: "Paediatrics",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Oncology
  {
    id: "dr-harish-kela",
    name: "Dr. Harish Kela",
    specialty: "Onco Surgery",
    qualification: "MBBS, MS, MCh",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-bharat-vaswani",
    name: "Dr. Bharat Vaswani",
    specialty: "Haemato-Oncology",
    qualification: "MBBS, MD, DM, MRCP",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Neurology
  {
    id: "dr-parag-moon",
    name: "Dr. Parag Moon",
    specialty: "Neurology",
    qualification: "MBBS, MD, DM (Neuro)",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-parag-maheshkar",
    name: "Dr. Parag Maheshkar",
    specialty: "Neurology",
    qualification: "MBBS, MD, DM",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Neurosurgery & Spine Surgery
  {
    id: "dr-piyush-thombare",
    name: "Dr. Piyush Thombare",
    photo: "/images/doctors/dr-piyush-thombare.jpg",
    specialty: "Neurosurgery & Spine Surgery",
    qualification: "MBBS, MS, MCh (DNB)",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-kshitij-gulhane",
    name: "Dr. Kshitij Gulhane",
    specialty: "Neurosurgery & Spine Surgery",
    qualification: "MBBS, MCh",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Nephrology
  {
    id: "dr-manoj-umare",
    name: "Dr. Manoj Umare",
    photo: "/images/doctors/dr-manoj-umare.jpg",
    specialty: "Nephrology",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-piyush-kimmatkar",
    name: "Dr. Piyush Kimmatkar",
    specialty: "Nephrology",
    qualification: "MBBS, MD (Nephrology)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Urology & Andrology
  {
    id: "dr-jayant-nikose",
    name: "Dr. Jayant Nikose",
    specialty: "Urology & Andrology",
    qualification: "MBBS, MS, MCh (Uro)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Gastroenterology
  {
    id: "dr-nikhil-khobragade",
    name: "Dr. Nikhil Khobragade",
    specialty: "Gastroenterology",
    qualification: "MBBS, MD, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Interventional Neurology
  {
    id: "dr-dinesh-sharma",
    name: "Dr. Dinesh Sharma",
    specialty: "Interventional Neurology",
    qualification: "MBBS, MD, DM, DNB",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Interventional Radiology
  {
    id: "dr-arpit-dhakate",
    name: "Dr. Arpit Dhakate",
    specialty: "Interventional Radiology",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-manish-agrawal",
    name: "Dr. Manish Agrawal",
    specialty: "Interventional Radiology",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Ophthalmology
  {
    id: "dr-ashutosh-jaiswal",
    name: "Dr. Ashutosh Jaiswal",
    specialty: "Ophthalmology",
    qualification: "MBBS, MS, FMRF, FICO",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-mansi-deshmukh",
    name: "Dr. Mansi Deshmukh (Ghodkhande)",
    specialty: "Ophthalmology",
    qualification: "MBBS, DOMS, FCOG",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Plastic & Reconstructive Surgery
  {
    id: "dr-sameer-mahakalkar",
    name: "Dr. Sameer Mahakalkar",
    photo: "/images/doctors/dr-sameer-mahakalkar.jpg",
    specialty: "Plastic & Reconstructive Surgery",
    qualification: "MBBS, MS, MCh",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Radiology
  {
    id: "dr-minal-bhawatkar",
    name: "Dr. Minal Bhawatkar",
    specialty: "Radiology",
    qualification: "MBBS, DMRE",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Pathology
  {
    id: "dr-m-pravin",
    name: "Dr. M Pravin",
    specialty: "Pathology",
    qualification: "MBBS, MD (Pathology)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Psychiatry
  {
    id: "dr-pranav-pohane",
    name: "Dr. Pranav Pohane",
    photo: "/images/doctors/dr-pranav-pohane.jpg",
    specialty: "Psychiatry",
    qualification: "MBBS, DNB (Psychiatry)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Physiotherapy
  {
    id: "dr-poonam-talhar",
    name: "Dr. Poonam Talhar",
    specialty: "Physiotherapy",
    qualification: "BPTh/BPT, MPTh/MPT",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-chanakya-patil",
    name: "Dr. Chanakya Patil",
    photo: "/images/doctors/dr-chanakya-patil.jpg",
    specialty: "Physiotherapy",
    qualification: "BPTh, MPT (Neuro)",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Anaesthesiology
  {
    id: "dr-rahul-jibhakate",
    name: "Dr. Rahul Jibhakate",
    photo: "/images/doctors/dr-rahul-jibhakate.jpg",
    specialty: "Anaesthesiology",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    id: "dr-sameer-tarsekar",
    name: "Dr. Sameer Tarsekar",
    specialty: "Anaesthesiology",
    qualification: "MBBS, MD",
    languages: ["English", "Hindi", "Marathi"],
  },
  // Maxillofacial Surgery
  {
    id: "dr-shashwat-magarkar",
    name: "Dr. Shashwat Magarkar",
    specialty: "Maxillofacial Surgery",
    qualification: "BDS, MDS, DMI, MSBU",
    languages: ["English", "Hindi", "Marathi"],
  },
];

// symptoms: first pass, pending doctor review
export const departments: Department[] = [
  {
    id: "medicine-pulmonology-critical-care",
    name: "Medicine, Pulmonology & Critical Care",
    shortName: "Medicine & Critical Care",
    blurb: "General medicine, lung care and intensive care for adults.",
    icon: "Stethoscope",
    description: "Internal medicine, respiratory care and ICU services.",
    doctors: 2,
    symptoms: ["Fever", "Cough", "Breathlessness", "Wheezing", "Fatigue", "Uncontrolled blood sugar", "Needs ICU care", "diabetes", "asthma", "breathing difficulty"],
  },
  {
    id: "interventional-cardiology",
    name: "Interventional Cardiology",
    blurb: "Heart tests, angiography, angioplasty and pacemaker care.",
    icon: "Heart",
    description: "Angiography, angioplasty and pacemaker care.",
    doctors: 2,
    symptoms: ["Chest pain", "Palpitations", "Breathlessness", "High blood pressure", "Swollen ankles", "Fainting", "heart", "heart attack"],
    conditions: ["Coronary artery disease", "Heart attack", "Heart failure", "Hypertension", "Arrhythmia"],
    procedures: ["ECG", "2D Echo", "Treadmill test (TMT)", "Holter monitoring", "Coronary angiography", "Angioplasty and stenting", "Pacemaker implantation"],
    faqs: [
      { q: "Do I need a referral to see a cardiologist?", a: "No. You can book an appointment directly with the cardiology department." },
      { q: "Which heart tests are done here?", a: "ECG, 2D Echo, treadmill test (TMT), Holter monitoring and blood investigations." },
      { q: "Is emergency cardiac care available?", a: "Yes. The hospital has an ICU and emergency support for cardiac emergencies." },
    ],
  },
  {
    id: "neurology",
    name: "Neurology",
    blurb: "Care for stroke, seizures, headaches and nerve conditions.",
    icon: "Brain",
    description: "Diagnosis and treatment of brain, nerve and stroke conditions.",
    doctors: 2,
    symptoms: ["Persistent headache", "Seizures", "Sudden weakness", "Numbness", "Memory loss", "Dizziness", "Tremors", "paralysis", "stroke", "seizure"],
    conditions: ["Stroke", "Epilepsy", "Migraine", "Parkinson's disease", "Neuropathy", "Multiple sclerosis", "Dementia"],
    procedures: ["CT scan", "EEG", "Nerve conduction study", "Acute stroke management"],
    faqs: [
      { q: "When should I see a neurologist?", a: "See one if you have persistent headaches, weakness, seizures, memory problems, balance issues or back pain that does not improve." },
      { q: "Is emergency stroke care available?", a: "Yes. Emergency neurology and trauma care, including acute stroke management, is available round the clock." },
      { q: "Which tests are used to diagnose neurological conditions?", a: "Common tests include CT scan, EEG and nerve conduction studies. If an MRI is needed, we refer you to a nearby centre." },
    ],
  },
  {
    id: "neurosurgery-spine",
    name: "Neurosurgery & Spine Surgery",
    icon: "Brain",
    description: "Surgery for brain and spine conditions.",
    doctors: 2,
    symptoms: ["Severe back pain", "Leg pain or numbness", "Neck pain", "Head injury", "Weakness in limbs"],
  },
  {
    id: "orthopaedic-trauma-spine",
    name: "Orthopaedic, Trauma & Spine Surgery",
    shortName: "Orthopaedics & Spine",
    blurb: "Joint replacement, fracture care and spine surgery.",
    icon: "Bone",
    description: "Joint replacement, fracture care, and spine surgery.",
    doctors: 1,
    symptoms: ["Knee pain", "Joint stiffness", "Back pain", "Fracture", "Sports injury", "Difficulty walking", "knee replacement", "joint pain"],
    conditions: ["Arthritis", "Fractures", "Ligament and meniscus injuries", "Slipped disc", "Rotator cuff tears", "Limb deformities in children"],
    procedures: ["Knee and hip replacement", "Arthroscopy", "Fracture fixation", "Microdiscectomy", "Spinal fusion", "Physiotherapy and rehabilitation"],
    faqs: [
      { q: "How long is the hospital stay after a joint replacement?", a: "Many patients start walking the day after surgery and go home within a few days. The surgeon will confirm the plan for you." },
      { q: "Can long-standing joint pain be treated?", a: "Yes. Treatment ranges from medicines and physiotherapy to surgery, depending on the assessment." },
      { q: "Should young patients and athletes get pain checked early?", a: "Yes. Early assessment helps prevent a small injury from becoming a larger problem." },
    ],
  },
  {
    id: "general-minimal-invasive-surgery",
    name: "General & Minimal Invasive Surgery",
    icon: "Syringe",
    description: "Laparoscopic and minimally invasive surgical procedures.",
    doctors: 3,
    symptoms: ["Abdominal pain", "Hernia swelling", "Gallbladder pain", "Piles", "Lump or swelling"],
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology",
    blurb: "Digestive and liver care, with endoscopy services.",
    icon: "Activity",
    description: "Digestive system disorders, with endoscopy services.",
    doctors: 1,
    symptoms: ["Abdominal pain", "Acid reflux", "Bloating", "Constipation", "Diarrhoea", "Blood in stool", "Jaundice"],
    conditions: ["Acid reflux", "Irritable bowel syndrome", "Inflammatory bowel disease", "Hepatitis", "Cirrhosis", "Fatty liver", "Pancreatitis", "Gallstones"],
    procedures: ["Upper GI endoscopy", "Colonoscopy", "ERCP", "Polyp removal", "Variceal banding"],
    faqs: [
      { q: "Which symptoms mean I should see a gastroenterologist?", a: "Persistent abdominal pain, bloating, diarrhoea, constipation, acid reflux, unexplained weight loss or blood in stool." },
      { q: "Is an endoscopy painful?", a: "It is usually done under sedation and is generally painless." },
      { q: "Are chronic liver diseases treated here?", a: "Yes. Diagnosis and treatment cover hepatitis, fatty liver and cirrhosis." },
    ],
  },
  {
    id: "urology-andrology",
    name: "Urology & Andrology",
    icon: "Pill",
    description: "Kidney stone management and urological care.",
    doctors: 1,
    symptoms: ["Burning urination", "Blood in urine", "Kidney stone pain", "Frequent urination", "Difficulty passing urine"],
  },
  {
    id: "nephrology",
    name: "Nephrology",
    shortName: "Nephrology & Dialysis",
    blurb: "Kidney disease care with a dialysis unit.",
    icon: "Activity",
    description: "Kidney disease management and dialysis services.",
    doctors: 2,
    symptoms: ["Swelling in feet or face", "Reduced urine", "Foamy urine", "High blood pressure", "Needs dialysis", "Persistent tiredness"],
    conditions: ["Chronic kidney disease", "Acute kidney injury", "Diabetic kidney disease", "Hypertension-related kidney disease", "Kidney failure"],
    procedures: ["Hemodialysis", "Peritoneal dialysis", "Emergency dialysis", "Kidney transplant evaluation and follow-up care"],
    faqs: [
      { q: "How long does a dialysis session take?", a: "A session usually takes about 3 to 4 hours, depending on the patient's condition." },
      { q: "Is emergency dialysis available?", a: "Yes. The emergency unit works round the clock for critical kidney conditions." },
      { q: "Can patients with diabetes or high blood pressure have dialysis?", a: "Yes. Many such patients are treated under nephrologist supervision." },
    ],
  },
  {
    id: "gynaecology-obstetrics",
    name: "Gynaecology & Obstetrics",
    blurb: "Women's health, pregnancy and delivery care.",
    icon: "Baby",
    description: "Complete women's health and maternity services.",
    doctors: 2,
    symptoms: ["Irregular periods", "Pregnancy care", "Pelvic pain", "Heavy bleeding", "Difficulty conceiving", "delivery", "pregnancy"],
  },
  {
    id: "pediatrics",
    name: "Paediatrics",
    shortName: "Paediatrics & NICU",
    blurb: "Care for newborns, children and teenagers, with a NICU.",
    icon: "Baby",
    description: "Specialized care for infants, children, and adolescents.",
    doctors: 2,
    symptoms: ["Child fever", "Cough and cold", "Poor feeding", "Vaccination", "Newborn care", "Slow growth", "baby", "newborn", "pediatrics"],
    conditions: ["Childhood infections", "Allergies", "Asthma", "Childhood diabetes", "Epilepsy", "Premature birth"],
    procedures: ["Well-child visits", "Routine immunisation", "NICU care for premature and sick newborns", "Developmental assessment"],
    faqs: [
      { q: "Is there a NICU for newborns?", a: "Yes. Premature and sick newborns are cared for in the neonatal intensive care unit." },
      { q: "Are routine vaccinations given here?", a: "Yes. Well-child visits and routine immunisations are part of paediatric care." },
      { q: "Is help available for nutrition and behaviour concerns?", a: "Yes. Paediatricians advise on nutrition, sleep and weight, and assess behavioural and developmental concerns." },
    ],
  },
  {
    id: "haemato-oncology",
    name: "Haemato-Oncology",
    icon: "Microscope",
    description: "Blood disorders and cancer treatment.",
    doctors: 1,
    symptoms: ["Unexplained weight loss", "Persistent fatigue", "Easy bruising", "Swollen glands", "Pale skin"],
  },
  {
    id: "onco-surgery",
    name: "Onco Surgery",
    icon: "Syringe",
    description: "Surgical treatment of cancers.",
    doctors: 1,
    symptoms: ["Lump in the body", "Non-healing ulcer", "Unexplained bleeding", "Difficulty swallowing"],
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    icon: "Eye",
    description: "Eye care and eye surgery.",
    doctors: 2,
    symptoms: ["Blurred vision", "Eye pain", "Red eye", "Watering eyes", "Cloudy vision"],
  },
  {
    id: "interventional-neurology",
    name: "Interventional Neurology",
    icon: "Brain",
    description: "Minimally invasive treatment for neurological conditions.",
    doctors: 1,
    symptoms: ["Sudden weakness", "Slurred speech", "Severe headache", "Facial droop"],
  },
  {
    id: "interventional-radiology",
    name: "Interventional Radiology",
    icon: "Microscope",
    description: "Image-guided minimally invasive procedures.",
    doctors: 2,
    symptoms: ["Blocked blood vessel", "Swollen veins", "Needs biopsy", "Liver lump"],
  },
  {
    id: "plastic-reconstructive-surgery",
    name: "Plastic & Reconstructive Surgery",
    icon: "Syringe",
    description: "Cosmetic and reconstructive surgical procedures.",
    doctors: 1,
    symptoms: ["Burn scars", "Wound reconstruction", "Hand injury", "Cleft lip or palate"],
  },
  {
    id: "radiology",
    name: "Radiology",
    icon: "Microscope",
    description: "Imaging including CT, digital X-ray and ultrasound.",
    doctors: 1,
    symptoms: ["Needs CT scan", "Needs X-ray", "Needs ultrasound", "Pregnancy scan", "x-ray", "ct scan", "ultrasound"],
  },
  {
    id: "pathology",
    name: "Pathology",
    icon: "Microscope",
    description: "Diagnostic laboratory services.",
    doctors: 1,
    symptoms: ["Needs blood test", "Needs urine test", "Health check-up", "Biopsy report"],
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    icon: "Brain",
    description: "Mental health diagnosis and treatment.",
    doctors: 1,
    symptoms: ["Anxiety", "Low mood", "Sleep problems", "Panic attacks", "Stress"],
  },
  {
    id: "physiotherapy",
    name: "Physiotherapy",
    icon: "Activity",
    description: "Rehabilitation and physical therapy services.",
    doctors: 2,
    symptoms: ["Stiff joints", "Recovery after surgery", "Muscle weakness", "Back pain"],
  },
  {
    id: "anaesthiology",
    name: "Anaesthesiology",
    icon: "Pill",
    description: "Anaesthesia and pain management services.",
    doctors: 2,
    symptoms: ["Chronic pain", "Pre-surgery assessment", "Nerve pain"],
  },
  {
    id: "maxillo-facial-surgery",
    name: "Maxillofacial Surgery",
    icon: "Syringe",
    description: "Oral and facial surgical procedures.",
    doctors: 1,
    symptoms: ["Jaw pain", "Facial injury", "Impacted tooth", "Facial swelling"],
  },
];

export const hospitalInfo = {
  name: "YES Hospital & Research Centre",
  tagline: "Say Yes to Life",
  address: "Plot No. 1 & 1A, Dighori Flyover Square, Dighori, Nagpur, Maharashtra 440024",
  phones: ["+91 8446 208 245", "+91 8446 208 246"],
  emergencyPhones: ["+91 8446 508 046", "+91 8446 508 047"],
  emails: ["yeshospitalandresearchcentre@gmail.com"],
  about: `YES Hospital & Research Centre is a multispeciality hospital at Dighori Flyover Square, Nagpur, Maharashtra. Our specialist doctors, modern diagnostics and nursing teams look after patients from first consultation to recovery, with 24/7 emergency care.

We offer medical services ranging from preventive care to complex surgical procedures, and every patient receives careful, evidence-based treatment and personal attention.`,
  mission: "To provide careful, evidence-based healthcare with compassion and integrity, and to make quality medical care accessible to all.",
  vision: "To be the hospital families in South Nagpur trust first for specialist and emergency care.",
  values: [
    "Patient-First Approach",
    "Clinical Excellence",
    "Compassionate Care",
    "Ethical Practice",
    "Continuous Innovation",
    "Community Service",
  ],
  facilities: [
    // From the live site's equipment list; confirm before adding anything else.
    "Cardiac Catheterization Lab",
    "ICU & NICU",
    "Modular Operation Theatres",
    "24/7 Emergency Services",
    "CT Scan, Digital X-ray & Ultrasound",
    "Dialysis Unit",
    "Endoscopy Unit",
    "Labour Room",
  ],
};

// Public patient videos on the hospital's YouTube channel (@yeshospital-r3d).
export const testimonials = [
  { name: "Teerath Thakur", videoId: "h7V1eiVcFqg", language: "Recovery story" },
  { name: "Radheshyam Agrawal", videoId: "uOOAgmJdjr0", language: "Recovery story (Hindi)" },
];


export const insurers: string[] = [
  "Star Health & Allied Insurance",
  "Aditya Birla Health Insurance",
  "ICICI Lombard General Insurance",
  "SBI General Insurance",
  "Bajaj Allianz General Insurance",
  "TATA AIG",
  "Care Health",
  "Future Generali India Insurance",
  "Bharti AXA",
  "Reliance General Insurance",
  "Universal Sompo General Insurance",
  "Acko General Insurance",
  "United Health Care Parekh Insurance",
  "Navi",
  "Raheja",
  "Reliance Life",
  "Edelweiss",
  "Go Digit",
  "Liberty",
  "Iffco Tokio",
  "Magma",
  "Royal Sundaram",
  "Shikhar",
  "National Insurance",
  "L & T General",
  "Chola MS",
  "Manipal Cigna TTK",
];

export const tpas: string[] = [
  "Mediassist TPA",
  "East West TPA",
  "MD India",
  "FHPL TPA",
  "Paramount TPA",
  "Genins India TPA",
];

export const schemes: { name: string; description: string }[] = [
  {
    name: "CGHS",
    description: "Central Government Health Scheme",
  },
  {
    name: "Mahatma Jyotiba Phule Jan Arogya Yojana",
    description: "Maharashtra State Health Assurance Scheme",
  },
  {
    name: "Pradhan Mantri Jan Arogya Yojana",
    description: "Ayushman Bharat - National Health Protection Scheme",
  },
];

export const featuredDepartmentIds: string[] = [
  "interventional-cardiology",
  "neurology",
  "orthopaedic-trauma-spine",
  "nephrology",
  "pediatrics",
  "gynaecology-obstetrics",
  "gastroenterology",
  "medicine-pulmonology-critical-care",
];

export const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "Call reception on +91 8446 208 245 or visit the reception desk. Tell them which doctor or department you need and which day suits you.",
  },
  {
    question: "What should I bring for my first visit?",
    answer: "Please bring a valid ID, any previous medical records or test reports, a list of current medications, your insurance card if you have one, and the appointment confirmation.",
  },
  {
    question: "Do you accept health insurance?",
    answer: "Yes. The hospital works with several insurers, TPAs and government schemes, including CGHS, PM-JAY (Ayushman Bharat) and MJPJAY. Please bring your insurance card when you visit.",
  },
  {
    question: "Do you offer emergency services?",
    answer: "Yes. The emergency department is open round the clock. Call +91 8446 508 046 / 047 or come directly to the emergency entrance.",
  },
  {
    question: "How can I get my medical records?",
    answer: "Request them at the Medical Records Department. You will need to fill out a request form and show a valid ID.",
  },
];

// Titles from YouTube oEmbed (scripts/youtube-titles.mjs), emoji removed.
export const videos: { id: string; title: string }[] = [
  { id: "peywKzIr1Ys", title: "Not Every Cough Needs a Syrup! | Child Health Awareness by Dr. Sandeep Manwatkar | YES Hospital" },
  { id: "2YyvXMQF8Ls", title: "Expert Physiotherapy Care at YES Hospital | Dr. Chanakya Patil" },
  { id: "e4wtUHNEclQ", title: "Dr. Rajesh Baghe on medicines and infectious diseases" }, // YouTube title shortened
  { id: "1bclPrQ5v8A", title: "Post-Surgery Recovery: How to Get Back to Normal Faster? | Dr. Pramey Dhage" },
  { id: "rDCS4z8B-2s", title: "Laparoscopic Surgery - A Minimally Invasive Solution | Dr. Pramey Dhage" },
  { id: "Yl4gWi90adE", title: "What Diseases & Treatments Are Available at Yes Hospital? | Dr. Pramey Dhage | General Surgeon" },
  { id: "xQQjB9XhpO4", title: "Types of Surgery | Dr. Pramey Dhage | General Surgeon | Yes Hospital, Nagpur" },
  { id: "i9CVRjmPLz4", title: "Oral Cancer Awareness Month | Dr. Anirudh Wagh | Yes Hospital Nagpur | Early Detection Saves Lives" },
  { id: "h7V1eiVcFqg", title: "Patient Teerath Thakur's Recovery Journey at YES Hospital | Trusted by Nagpur Families" },
  { id: "VoJdKpxg9WA", title: "Benefits of Physiotherapy After Knee Replacement | Dr. Chankya Patil | YES Hospital Nagpur" },
  { id: "syXc9KuuUpc", title: "What You Must Know About Heart Attacks | Dr. Rupesh Agarwal | Cardiologist at YES Hospital" },
  { id: "11wDZsYuEDE", title: "Angiography & Angioplasty Explained | Dr. Rupesh Agarwal | YES Hospital Nagpur" },
  { id: "uOOAgmJdjr0", title: "Radheshyam Agrawal's Recovery Journey | Yes Hospital Nagpur | Patient Review in Hindi" },
  { id: "YFh6j_j05G8", title: "आहाराचे महत्त्व – आरोग्याचा पाया!आरोग्यदायी आयुष्यासाठी योग्य आहार अत्यावश्यक आहे!" },
];
