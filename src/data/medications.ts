
export interface Medication {
  name_es: string;
  name_en: string;
  brand_examples: string[];
  dosage_forms: string[];
  typical_dosage: string;
  max_daily: string;
  contraindications: string[];
  pharmacy_availability?: {
    farmacia_del_ahorro?: boolean;
    farmacia_similares?: boolean;
    other?: string[];
  };
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface MedicationCategory {
  category: string;
  conditions: string[];
  medications: Medication[];
}

const medicationDatabase: MedicationCategory[] = [
  {
    category: "Alivio del Dolor",
    conditions: ["Dolor de cabeza", "Dolor muscular", "Dolor articular", "Migraña", "Dolor menstrual"],
    medications: [
      {
        name_es: "Paracetamol",
        name_en: "Acetaminophen",
        brand_examples: ["Tylenol", "Tempra", "Panadol"],
        dosage_forms: ["tabletas", "jarabe", "gotas"],
        typical_dosage: "500-1000mg cada 4-6 horas según sea necesario",
        max_daily: "4000mg",
        contraindications: ["Enfermedad hepática", "Consumo de alcohol >3 bebidas/día"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 25,
          max: 120,
          currency: "MXN"
        }
      },
      {
        name_es: "Ibuprofeno",
        name_en: "Ibuprofen",
        brand_examples: ["Advil", "Motrin", "Nurofen"],
        dosage_forms: ["tabletas", "cápsulas", "suspensión"],
        typical_dosage: "200-400mg cada 4-6 horas según sea necesario",
        max_daily: "1200mg",
        contraindications: ["Úlcera péptica", "Enfermedad renal", "Asma sensible a aspirina", "Embarazo (tercer trimestre)"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 35,
          max: 150,
          currency: "MXN"
        }
      },
      {
        name_es: "Naproxeno",
        name_en: "Naproxen",
        brand_examples: ["Aleve", "Naprosyn", "Flanax"],
        dosage_forms: ["tabletas", "cápsulas", "suspensión"],
        typical_dosage: "250-500mg cada 8-12 horas según sea necesario",
        max_daily: "1250mg",
        contraindications: ["Úlcera péptica", "Enfermedad renal", "Asma sensible a aspirina", "Embarazo (tercer trimestre)"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 40,
          max: 180,
          currency: "MXN"
        }
      }
    ]
  },
  {
    category: "Fiebre",
    conditions: ["Fiebre", "Temperatura elevada", "Pirexia"],
    medications: [
      {
        name_es: "Paracetamol",
        name_en: "Acetaminophen",
        brand_examples: ["Tylenol", "Tempra", "Panadol"],
        dosage_forms: ["tabletas", "jarabe", "gotas"],
        typical_dosage: "500-1000mg cada 4-6 horas según sea necesario",
        max_daily: "4000mg",
        contraindications: ["Enfermedad hepática", "Consumo de alcohol >3 bebidas/día"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 25,
          max: 120,
          currency: "MXN"
        }
      },
      {
        name_es: "Ibuprofeno",
        name_en: "Ibuprofen",
        brand_examples: ["Advil", "Motrin", "Nurofen"],
        dosage_forms: ["tabletas", "cápsulas", "suspensión"],
        typical_dosage: "200-400mg cada 4-6 horas según sea necesario",
        max_daily: "1200mg",
        contraindications: ["Úlcera péptica", "Enfermedad renal", "Asma sensible a aspirina", "Embarazo (tercer trimestre)"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 35,
          max: 150,
          currency: "MXN"
        }
      }
    ]
  },
  {
    category: "Problemas Digestivos",
    conditions: ["Acidez", "Indigestión", "Reflujo ácido", "Malestar estomacal", "Náuseas", "Diarrea"],
    medications: [
      {
        name_es: "Omeprazol",
        name_en: "Omeprazole",
        brand_examples: ["Prilosec", "Losec", "Omez"],
        dosage_forms: ["cápsulas", "tabletas"],
        typical_dosage: "20mg una vez al día",
        max_daily: "40mg",
        contraindications: ["Hipersensibilidad a inhibidores de la bomba de protones"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 50,
          max: 200,
          currency: "MXN"
        }
      },
      {
        name_es: "Loperamida",
        name_en: "Loperamide",
        brand_examples: ["Imodium", "Pepto Diarrea Control"],
        dosage_forms: ["cápsulas", "tabletas", "líquido"],
        typical_dosage: "Inicialmente 4mg, luego 2mg después de cada deposición suelta",
        max_daily: "16mg",
        contraindications: ["Disentería aguda", "Colitis ulcerosa aguda", "Diarrea asociada a antibióticos"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 45,
          max: 160,
          currency: "MXN"
        }
      },
      {
        name_es: "Bismuto Subsalicilato",
        name_en: "Bismuth Subsalicylate",
        brand_examples: ["Pepto-Bismol", "Bismatrol"],
        dosage_forms: ["tabletas", "líquido"],
        typical_dosage: "524mg cada 30-60 minutos según sea necesario",
        max_daily: "4192mg (8 dosis)",
        contraindications: ["Alergia a salicilatos", "Úlceras sangrantes", "Problemas de coagulación"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 60,
          max: 180,
          currency: "MXN"
        }
      }
    ]
  },
  {
    category: "Problemas Respiratorios",
    conditions: ["Congestión nasal", "Tos", "Alergias", "Resfriado común", "Sinusitis"],
    medications: [
      {
        name_es: "Loratadina",
        name_en: "Loratadine",
        brand_examples: ["Claritin", "Clarityne", "Alavert"],
        dosage_forms: ["tabletas", "jarabe"],
        typical_dosage: "10mg una vez al día",
        max_daily: "10mg",
        contraindications: ["Hipersensibilidad a antihistamínicos"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 40,
          max: 150,
          currency: "MXN"
        }
      },
      {
        name_es: "Dextrometorfano",
        name_en: "Dextromethorphan",
        brand_examples: ["Robitussin", "Vicks Formula 44"],
        dosage_forms: ["jarabe", "pastillas"],
        typical_dosage: "10-20mg cada 4 horas según sea necesario",
        max_daily: "120mg",
        contraindications: ["Uso de inhibidores de la MAO", "Asma severa"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 55,
          max: 190,
          currency: "MXN"
        }
      },
      {
        name_es: "Pseudoefedrina",
        name_en: "Pseudoephedrine",
        brand_examples: ["Sudafed", "Advil Congestion Relief"],
        dosage_forms: ["tabletas", "cápsulas"],
        typical_dosage: "60mg cada 4-6 horas según sea necesario",
        max_daily: "240mg",
        contraindications: ["Hipertensión severa", "Enfermedad cardíaca", "Glaucoma", "Hipertiroidismo"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 65,
          max: 210,
          currency: "MXN"
        }
      }
    ]
  },
  {
    category: "Problemas de Piel",
    conditions: ["Erupciones cutáneas", "Picazón", "Eccema", "Dermatitis", "Quemaduras leves", "Picaduras de insectos"],
    medications: [
      {
        name_es: "Hidrocortisona",
        name_en: "Hydrocortisone",
        brand_examples: ["Cortaid", "Cortizone-10"],
        dosage_forms: ["crema", "ungüento", "loción"],
        typical_dosage: "Aplicar una capa delgada 2-4 veces al día",
        max_daily: "No exceder 4 aplicaciones",
        contraindications: ["Infecciones fúngicas de la piel", "Tuberculosis cutánea", "Rosácea"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 70,
          max: 220,
          currency: "MXN"
        }
      },
      {
        name_es: "Difenhidramina",
        name_en: "Diphenhydramine",
        brand_examples: ["Benadryl", "Allerdryl"],
        dosage_forms: ["crema", "gel", "spray"],
        typical_dosage: "Aplicar a las áreas afectadas 3-4 veces al día",
        max_daily: "No exceder 4 aplicaciones",
        contraindications: ["Heridas abiertas", "Hipersensibilidad a antihistamínicos"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 60,
          max: 180,
          currency: "MXN"
        }
      },
      {
        name_es: "Calamina",
        name_en: "Calamine",
        brand_examples: ["Caladryl", "Calamine Lotion"],
        dosage_forms: ["loción"],
        typical_dosage: "Aplicar a las áreas afectadas 3-4 veces al día",
        max_daily: "No exceder 6 aplicaciones",
        contraindications: ["Heridas abiertas", "Quemaduras graves"],
        pharmacy_availability: {
          farmacia_del_ahorro: true,
          farmacia_similares: true
        },
        price_range: {
          min: 45,
          max: 140,
          currency: "MXN"
        }
      }
    ]
  }
];

export default medicationDatabase;
