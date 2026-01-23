/**
 * Drug Interaction Service
 * Checks for potential drug interactions and contraindications
 */

import { supabase } from '../../lib/supabase';

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  activeIngredients: string[];
  category: string;
  contraindications: string[];
  warnings: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
}

export interface PatientProfile {
  age: number;
  allergies: string[];
  conditions: string[];
  currentMedications: string[];
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
}

export class DrugInteractionService {
  private static instance: DrugInteractionService;
  private drugDatabase: Map<string, Drug> = new Map();
  private interactionDatabase: Map<string, DrugInteraction[]> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DrugInteractionService {
    if (!DrugInteractionService.instance) {
      DrugInteractionService.instance = new DrugInteractionService();
    }
    return DrugInteractionService.instance;
  }

  /**
   * Initialize the drug interaction database
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load drug database from Supabase
      const { data: drugs, error: drugsError } = await supabase
        .from('drugs')
        .select('*');

      if (drugsError) {
        console.error('Error loading drugs:', drugsError);
        // Fall back to local database
        this.loadLocalDatabase();
      } else if (drugs) {
        drugs.forEach(drug => {
          this.drugDatabase.set(drug.genericName.toLowerCase(), drug);
        });
      }

      // Load interaction database
      const { data: interactions, error: interactionsError } = await supabase
        .from('drug_interactions')
        .select('*');

      if (interactionsError) {
        console.error('Error loading interactions:', interactionsError);
        // Fall back to local interactions
        this.loadLocalInteractions();
      } else if (interactions) {
        interactions.forEach(interaction => {
          const key = this.getInteractionKey(interaction.drug1, interaction.drug2);
          if (!this.interactionDatabase.has(key)) {
            this.interactionDatabase.set(key, []);
          }
          this.interactionDatabase.get(key)!.push(interaction);
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize drug interaction service:', error);
      this.loadLocalDatabase();
      this.loadLocalInteractions();
      this.isInitialized = true;
    }
  }

  /**
   * Check for drug interactions
   */
  public async checkInteractions(
    medications: string[],
    patientProfile?: PatientProfile
  ): Promise<{
    interactions: DrugInteraction[];
    contraindications: string[];
    warnings: string[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const interactions: DrugInteraction[] = [];
    const contraindications: string[] = [];
    const warnings: string[] = [];

    // Normalize medication names
    const normalizedMeds = medications.map(m => this.normalizeDrugName(m));

    // Check pairwise interactions
    for (let i = 0; i < normalizedMeds.length; i++) {
      for (let j = i + 1; j < normalizedMeds.length; j++) {
        const drug1 = normalizedMeds[i];
        const drug2 = normalizedMeds[j];
        
        const interactionKey = this.getInteractionKey(drug1, drug2);
        const foundInteractions = this.interactionDatabase.get(interactionKey) || [];
        
        interactions.push(...foundInteractions);
      }
    }

    // Check contraindications based on patient profile
    if (patientProfile) {
      for (const medication of normalizedMeds) {
        const drug = this.drugDatabase.get(medication);
        if (!drug) continue;

        // Age-based contraindications
        if (patientProfile.age < 18 && drug.warnings.includes('pediatric')) {
          warnings.push(`${drug.name} requiere precaución en pacientes pediátricos`);
        }
        if (patientProfile.age > 65 && drug.warnings.includes('geriatric')) {
          warnings.push(`${drug.name} requiere ajuste de dosis en pacientes geriátricos`);
        }

        // Pregnancy/breastfeeding
        if (patientProfile.isPregnant && drug.contraindications.includes('pregnancy')) {
          contraindications.push(`${drug.name} está contraindicado durante el embarazo`);
        }
        if (patientProfile.isBreastfeeding && drug.contraindications.includes('breastfeeding')) {
          contraindications.push(`${drug.name} está contraindicado durante la lactancia`);
        }

        // Allergy check
        for (const allergy of patientProfile.allergies) {
          if (drug.activeIngredients.some(ing => 
            ing.toLowerCase().includes(allergy.toLowerCase())
          )) {
            contraindications.push(`${drug.name} contiene ${allergy} - ALERGIA CONOCIDA`);
          }
        }

        // Condition-based contraindications
        for (const condition of patientProfile.conditions) {
          if (drug.contraindications.some(contra => 
            contra.toLowerCase().includes(condition.toLowerCase())
          )) {
            contraindications.push(`${drug.name} está contraindicado en pacientes con ${condition}`);
          }
        }
      }
    }

    // Sort by severity
    interactions.sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return { interactions, contraindications, warnings };
  }

  /**
   * Get drug information
   */
  public getDrugInfo(drugName: string): Drug | null {
    const normalized = this.normalizeDrugName(drugName);
    return this.drugDatabase.get(normalized) || null;
  }

  /**
   * Normalize drug name for comparison
   */
  private normalizeDrugName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
  }

  /**
   * Get interaction key for two drugs
   */
  private getInteractionKey(drug1: string, drug2: string): string {
    const sorted = [drug1, drug2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }

  /**
   * Load local drug database (fallback)
   */
  private loadLocalDatabase(): void {
    // Common Mexican medications
    const localDrugs: Drug[] = [
      {
        id: '1',
        name: 'Paracetamol',
        genericName: 'acetaminofen',
        activeIngredients: ['acetaminofen'],
        category: 'analgesico',
        contraindications: ['hepatopatia severa', 'alergia al paracetamol'],
        warnings: ['hepatotoxicidad', 'sobredosis']
      },
      {
        id: '2',
        name: 'Ibuprofeno',
        genericName: 'ibuprofeno',
        activeIngredients: ['ibuprofeno'],
        category: 'aine',
        contraindications: ['ulcera peptica', 'insuficiencia renal', 'pregnancy'],
        warnings: ['gastrico', 'renal', 'cardiovascular']
      },
      {
        id: '3',
        name: 'Amoxicilina',
        genericName: 'amoxicilina',
        activeIngredients: ['amoxicilina'],
        category: 'antibiotico',
        contraindications: ['alergia a penicilinas'],
        warnings: ['diarrea', 'rash']
      },
      {
        id: '4',
        name: 'Metformina',
        genericName: 'metformina',
        activeIngredients: ['metformina'],
        category: 'antidiabetico',
        contraindications: ['insuficiencia renal', 'acidosis metabolica'],
        warnings: ['acidosis lactica', 'deficit b12']
      },
      {
        id: '5',
        name: 'Losartan',
        genericName: 'losartan',
        activeIngredients: ['losartan'],
        category: 'antihipertensivo',
        contraindications: ['pregnancy', 'hiperpotasemia'],
        warnings: ['hipotension', 'renal']
      }
    ];

    localDrugs.forEach(drug => {
      this.drugDatabase.set(drug.genericName, drug);
    });
  }

  /**
   * Load local interaction database (fallback)
   */
  private loadLocalInteractions(): void {
    const localInteractions: DrugInteraction[] = [
      {
        drug1: 'ibuprofeno',
        drug2: 'metformina',
        severity: 'moderate',
        description: 'Los AINEs pueden reducir la función renal y aumentar el riesgo de acidosis láctica',
        recommendation: 'Monitorear función renal. Considerar alternativas como paracetamol'
      },
      {
        drug1: 'losartan',
        drug2: 'ibuprofeno',
        severity: 'major',
        description: 'Los AINEs pueden reducir el efecto antihipertensivo y aumentar el riesgo de daño renal',
        recommendation: 'Evitar uso concomitante si es posible. Monitorear presión arterial y función renal'
      },
      {
        drug1: 'amoxicilina',
        drug2: 'metformina',
        severity: 'minor',
        description: 'Antibióticos pueden alterar la flora intestinal y afectar la absorción de metformina',
        recommendation: 'Monitorear niveles de glucosa. Generalmente seguro'
      }
    ];

    localInteractions.forEach(interaction => {
      const key = this.getInteractionKey(interaction.drug1, interaction.drug2);
      if (!this.interactionDatabase.has(key)) {
        this.interactionDatabase.set(key, []);
      }
      this.interactionDatabase.get(key)!.push(interaction);
    });
  }

  /**
   * Format interaction report for display
   */
  public formatInteractionReport(
    results: Awaited<ReturnType<typeof this.checkInteractions>>
  ): string {
    let report = '';

    if (results.contraindications.length > 0) {
      report += '⛔ CONTRAINDICACIONES:\n';
      results.contraindications.forEach(c => {
        report += `• ${c}\n`;
      });
      report += '\n';
    }

    if (results.interactions.length > 0) {
      report += '⚠️ INTERACCIONES MEDICAMENTOSAS:\n';
      results.interactions.forEach(i => {
        const severityEmoji = {
          critical: '🚨',
          major: '⚠️',
          moderate: '⚡',
          minor: 'ℹ️'
        }[i.severity];
        
        report += `${severityEmoji} ${i.drug1} + ${i.drug2}:\n`;
        report += `   ${i.description}\n`;
        report += `   Recomendación: ${i.recommendation}\n\n`;
      });
    }

    if (results.warnings.length > 0) {
      report += '💊 ADVERTENCIAS:\n';
      results.warnings.forEach(w => {
        report += `• ${w}\n`;
      });
    }

    if (!report) {
      report = '✅ No se encontraron interacciones significativas entre los medicamentos.';
    }

    return report;
  }
}

// Export singleton instance
export const drugInteractionService = DrugInteractionService.getInstance();