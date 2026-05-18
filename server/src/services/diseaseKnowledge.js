/**
 * Curated symptom and prevention guidance for grounded fallback responses.
 * Keys are lowercase disease identifiers used for matching.
 */
export const DISEASE_KNOWLEDGE = {
  dengue: {
    symptoms: [
      'Sudden high fever (often 40°C / 104°F)',
      'Severe headache and pain behind the eyes',
      'Joint and muscle pain, nausea, and rash',
    ],
    warnings: [
      'Severe abdominal pain, persistent vomiting, bleeding gums, or lethargy — seek emergency care immediately.',
    ],
    prevention: [
      'Eliminate standing water where mosquitoes breed',
      'Use repellents and window screens; wear long sleeves at dawn and dusk',
      'Support community fogging during outbreaks',
    ],
  },
  malaria: {
    symptoms: [
      'Cyclic fever with chills and sweating',
      'Headache, body aches, and fatigue',
      'Nausea, vomiting, and sometimes diarrhea',
    ],
    warnings: [
      'Confusion, difficulty breathing, or dark urine may signal severe malaria — urgent treatment is required.',
    ],
    prevention: [
      'Sleep under insecticide-treated bed nets',
      'Use EPA-approved repellents; cover skin from dusk to dawn',
      'Take chemoprophylaxis when traveling to endemic areas',
      'Drain standing water near homes',
    ],
  },
  'covid-19': {
    symptoms: [
      'Fever, cough, sore throat, and congestion',
      'Fatigue, headache, and muscle aches',
      'Loss of taste or smell (may occur early)',
    ],
    warnings: [
      'Persistent chest pain, bluish lips, or oxygen saturation below 94% — seek medical care.',
    ],
    prevention: [
      'Stay up to date on vaccinations and boosters',
      'Improve ventilation indoors; wear masks in crowded settings during surges',
      'Isolate when symptomatic and test close contacts',
    ],
  },
  cholera: {
    symptoms: [
      'Profuse watery diarrhea ("rice-water" stools)',
      'Vomiting and rapid dehydration',
      'Leg cramps, thirst, and weakness',
    ],
    warnings: [
      'Severe dehydration (sunken eyes, little urine, confusion) is life-threatening — rehydrate and seek care immediately.',
    ],
    prevention: [
      'Drink only safe (boiled or treated) water',
      'Practice hand hygiene before eating',
      'Cook food thoroughly; avoid raw street food in outbreak areas',
      'Use oral rehydration salts (ORS) at first sign of diarrhea',
    ],
  },
  nipah: {
    symptoms: [
      'Fever and headache',
      'Respiratory symptoms (cough, sore throat)',
      'Drowsiness, confusion, or encephalitis in severe cases',
    ],
    warnings: [
      'Rapid progression to coma or seizures requires isolation and urgent hospital care.',
    ],
    prevention: [
      'Avoid raw date palm sap and unwashed fruit in affected areas',
      'Do not handle sick bats or pigs; use PPE if caring for patients',
      'Isolate suspected cases and trace contacts per public health guidance',
    ],
  },
  ebola: {
    symptoms: [
      'Sudden fever with fatigue and muscle pain',
      'Headache, sore throat, and vomiting',
      'Rash, impaired kidney/liver function, and bleeding in severe cases',
    ],
    warnings: [
      'Unexplained bleeding or shock — treat as a medical emergency with strict isolation.',
    ],
    prevention: [
      'Avoid contact with blood and body fluids of sick persons',
      'Follow burial protocols for victims of Ebola',
      'Healthcare workers must use full PPE and infection control',
    ],
  },
  zika: {
    symptoms: [
      'Mild fever, rash, and joint pain',
      'Conjunctivitis (red eyes) and headache',
      'Many infections are asymptomatic',
    ],
    warnings: [
      'Infection during pregnancy can cause microcephaly — pregnant individuals should avoid endemic areas.',
    ],
    prevention: [
      'Prevent mosquito bites (repellent, screens, long clothing)',
      'Use condoms or abstain from sex if partner may be infected',
      'Pregnant travelers should consult a clinician before visiting outbreak zones',
    ],
  },
  measles: {
    symptoms: [
      'High fever and cough',
      'Runny nose and red, watery eyes (conjunctivitis)',
      'Koplik spots in mouth, followed by a spreading rash',
    ],
    warnings: [
      'Pneumonia or encephalitis can complicate measles — especially in young or immunocompromised patients.',
    ],
    prevention: [
      'Ensure MMR vaccination (two doses for full protection)',
      'Isolate cases for four days after rash appears',
      'Post-exposure prophylaxis for unvaccinated contacts when indicated',
    ],
  },
  influenza: {
    symptoms: [
      'Sudden fever, cough, and sore throat',
      'Body aches, headache, and fatigue',
      'Sometimes vomiting or diarrhea (more common in children)',
    ],
    warnings: [
      'Difficulty breathing, chest pain, or dehydration — especially in elderly or chronically ill patients.',
    ],
    prevention: [
      'Annual influenza vaccination',
      'Cover coughs; wash hands frequently',
      'Stay home when ill to reduce transmission',
    ],
  },
  tuberculosis: {
    symptoms: [
      'Persistent cough lasting three weeks or more',
      'Coughing blood, chest pain, and weight loss',
      'Night sweats and fever',
    ],
    warnings: [
      'Untreated pulmonary TB is contagious — complete the full antibiotic course.',
    ],
    prevention: [
      'BCG vaccination where recommended',
      'Early detection via screening in high-risk groups',
      'Complete directly observed therapy (DOT) for active cases',
    ],
  },
  mers: {
    symptoms: [
      'Fever, cough, and shortness of breath',
      'Gastrointestinal symptoms in some patients',
      'Can progress to pneumonia and organ failure',
    ],
    warnings: [
      'Respiratory distress in travelers from the Arabian Peninsula or contacts of camels — isolate and test.',
    ],
    prevention: [
      'Avoid raw camel milk and undercooked camel meat',
      'Practice hand hygiene after contact with animals',
      'Healthcare settings require strict respiratory precautions',
    ],
  },
  typhoid: {
    symptoms: [
      'Sustained high fever and weakness',
      'Abdominal pain, headache, and rash (rose spots)',
      'Constipation or diarrhea',
    ],
    warnings: [
      'Intestinal perforation or severe dehydration — hospitalize if worsening.',
    ],
    prevention: [
      'Typhoid vaccination before travel to endemic regions',
      'Drink safe water; eat cooked food',
      'Handwashing before meals',
    ],
  },
  'yellow fever': {
    symptoms: [
      'Fever, chills, and muscle pain',
      'Headache and back pain',
      'Jaundice and bleeding in severe ("toxic") phase',
    ],
    warnings: [
      'Toxic phase carries high mortality — only supportive care is available; vaccinate before travel.',
    ],
    prevention: [
      'Yellow fever vaccination (required for entry to some countries)',
      'Mosquito bite prevention in endemic areas',
    ],
  },
  'hepatitis a': {
    symptoms: [
      'Fatigue, nausea, and abdominal discomfort',
      'Jaundice (yellow skin/eyes) and dark urine',
      'Low-grade fever and loss of appetite',
    ],
    warnings: [
      'Rare fulminant hepatitis — seek care if confusion or severe vomiting occurs.',
    ],
    prevention: [
      'Hepatitis A vaccination',
      'Safe water and food hygiene',
      'Handwashing after using the bathroom',
    ],
  },
  'lyme disease': {
    symptoms: [
      'Erythema migrans ("bull\'s-eye") rash at tick bite site',
      'Fever, fatigue, and muscle or joint aches',
      'Facial palsy or joint swelling if untreated',
    ],
    warnings: [
      'Cardiac or neurological symptoms after a tick bite — treat promptly with antibiotics.',
    ],
    prevention: [
      'Use repellent and permethrin-treated clothing in wooded areas',
      'Check for ticks after outdoor activity; remove within 24 hours',
    ],
  },
  'west nile virus': {
    symptoms: [
      'Most infections are mild: fever and body aches',
      'Headache and skin rash in some cases',
      'Severe neuroinvasive disease is rare but serious',
    ],
    warnings: [
      'Neck stiffness, confusion, or paralysis — emergency evaluation needed.',
    ],
    prevention: [
      'Mosquito bite prevention (repellent, screens, avoid dusk exposure)',
      'Community mosquito control programs',
    ],
  },
  norovirus: {
    symptoms: [
      'Sudden vomiting and watery diarrhea',
      'Stomach cramps, nausea, and low-grade fever',
      'Symptoms often resolve within 1–3 days',
    ],
    warnings: [
      'Prolonged dehydration in elderly or infants — monitor fluid intake.',
    ],
    prevention: [
      'Handwashing with soap, especially after using the toilet',
      'Disinfect contaminated surfaces; isolate ill food handlers',
      'Avoid preparing food for others while symptomatic',
    ],
  },
  'avian influenza': {
    symptoms: [
      'High fever and cough',
      'Muscle aches and respiratory distress',
      'Conjunctivitis may occur with certain strains',
    ],
    warnings: [
      'Rapid progression to pneumonia — high mortality with H5N1; report exposure to poultry.',
    ],
    prevention: [
      'Avoid live bird markets and sick poultry in outbreak areas',
      'Cook poultry and eggs thoroughly',
      'Healthcare workers use airborne precautions for suspected cases',
    ],
  },
};

const DISEASE_ALIASES = {
  covid: 'covid-19',
  coronavirus: 'covid-19',
  'west nile': 'west nile virus',
  hepatitis: 'hepatitis a',
  'yellow fever': 'yellow fever',
  typhoid: 'typhoid',
  'bird flu': 'avian influenza',
  h5n1: 'avian influenza',
};

/**
 * Resolve a disease name from user text or outbreak records.
 */
export function resolveDisease(message, outbreaks = []) {
  const lower = message.toLowerCase();

  for (const [alias, key] of Object.entries(DISEASE_ALIASES)) {
    if (lower.includes(alias)) return key;
  }

  for (const key of Object.keys(DISEASE_KNOWLEDGE)) {
    if (lower.includes(key)) return key;
  }

  if (outbreaks[0]?.disease) {
    const normalized = outbreaks[0].disease.toLowerCase().trim();
    if (DISEASE_KNOWLEDGE[normalized]) return normalized;
    for (const key of Object.keys(DISEASE_KNOWLEDGE)) {
      if (normalized.includes(key) || key.includes(normalized)) return key;
    }
    return normalized;
  }

  return null;
}

export function getDiseaseKnowledge(diseaseKey) {
  if (!diseaseKey) return null;
  const key = diseaseKey.toLowerCase().trim();
  if (DISEASE_KNOWLEDGE[key]) return DISEASE_KNOWLEDGE[key];

  for (const [known, info] of Object.entries(DISEASE_KNOWLEDGE)) {
    if (key.includes(known) || known.includes(key)) return info;
  }

  return null;
}

export function displayDiseaseName(diseaseKey, outbreaks = []) {
  if (outbreaks[0]?.disease) {
    const match = outbreaks.find(
      (o) => o.disease?.toLowerCase() === diseaseKey || o.disease?.toLowerCase().includes(diseaseKey)
    );
    if (match) return match.disease;
  }
  return diseaseKey
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
