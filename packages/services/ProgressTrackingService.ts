/**
 * ProgressTrackingService - Health progress and metrics tracking
 * Monitors treatment progress, symptom severity, and wellness goals
 */

import { loggingService } from './LoggingService';

interface HealthMetric {
  id: string;
  name: string;
  category: 'symptom' | 'vital' | 'lifestyle' | 'medication' | 'mood' | 'constitutional';
  unit: string;
  scale: {
    min: number;
    max: number;
    type: 'severity' | 'frequency' | 'numeric' | 'percentage';
  };
  description: string;
  mexicanContext?: string;
}

interface ProgressEntry {
  id: string;
  userId: string;
  metricId: string;
  value: number;
  notes?: string;
  timestamp: Date;
  sessionId?: string;
  contextData?: {
    weather?: string;
    mood?: number;
    stressLevel?: number;
    constitution?: 'vata' | 'pitta' | 'kapha';
    seasonalFactor?: string;
  };
}

interface ProgressTrend {
  metricId: string;
  direction: 'improving' | 'worsening' | 'stable';
  changePercentage: number;
  period: 'daily' | 'weekly' | 'monthly';
  significance: 'high' | 'medium' | 'low';
  insights: string[];
}

interface WellnessGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  category: 'symptom_reduction' | 'lifestyle_improvement' | 'constitutional_balance' | 'medication_adherence';
  progress: number; // 0-100%
  milestones: {
    value: number;
    label: string;
    achieved: boolean;
    achievedDate?: Date;
  }[];
  mexicanCulturalNotes?: string[];
}

interface ProgressDashboard {
  overview: {
    totalMetrics: number;
    activeGoals: number;
    improvingTrends: number;
    daysTracked: number;
    currentStreak: number;
  };
  recentEntries: ProgressEntry[];
  trends: ProgressTrend[];
  goals: WellnessGoal[];
  insights: {
    weekly: string[];
    monthly: string[];
    constitutional: string[];
    seasonal: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export class ProgressTrackingService {
  private static instance: ProgressTrackingService;
  
  // Predefined health metrics
  private healthMetrics: Map<string, HealthMetric> = new Map();
  
  // Mock data storage (in production, this would connect to database)
  private progressEntries: Map<string, ProgressEntry[]> = new Map();
  private wellnessGoals: Map<string, WellnessGoal[]> = new Map();

  static getInstance(): ProgressTrackingService {
    if (!ProgressTrackingService.instance) {
      ProgressTrackingService.instance = new ProgressTrackingService();
      ProgressTrackingService.instance.initializeMetrics();
      ProgressTrackingService.instance.initializeMockData();
    }
    return ProgressTrackingService.instance;
  }

  /**
   * Get available health metrics for tracking
   */
  getAvailableMetrics(): HealthMetric[] {
    return Array.from(this.healthMetrics.values());
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: HealthMetric['category']): HealthMetric[] {
    return Array.from(this.healthMetrics.values()).filter(metric => metric.category === category);
  }

  /**
   * Add progress entry
   */
  async addProgressEntry(entry: Omit<ProgressEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const progressEntry: ProgressEntry = {
        ...entry,
        id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      const userEntries = this.progressEntries.get(entry.userId) || [];
      userEntries.push(progressEntry);
      this.progressEntries.set(entry.userId, userEntries);

      loggingService.info('ProgressTracking', 'Progress entry added', {
        userId: entry.userId,
        metricId: entry.metricId,
        value: entry.value
      });

      // Log medical event for tracking
      loggingService.logMedicalEvent(
        'progress_tracked',
        {
          metricId: entry.metricId,
          value: entry.value,
          category: this.healthMetrics.get(entry.metricId)?.category
        },
        { userId: entry.userId, sessionId: entry.sessionId }
      );

      return progressEntry.id;

    } catch (error) {
      loggingService.error(
        'ProgressTracking',
        'Failed to add progress entry',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to add progress entry');
    }
  }

  /**
   * Get user's progress dashboard
   */
  async getProgressDashboard(userId: string, timeframe?: 'week' | 'month' | 'quarter'): Promise<ProgressDashboard> {
    const startTime = Date.now();
    
    try {
      loggingService.info('ProgressTracking', 'Generating progress dashboard', {
        userId,
        timeframe: timeframe || 'month'
      });

      const userEntries = this.progressEntries.get(userId) || [];
      const userGoals = this.wellnessGoals.get(userId) || [];

      // Calculate timeframe
      const days = timeframe === 'week' ? 7 : timeframe === 'quarter' ? 90 : 30;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const recentEntries = userEntries.filter(entry => entry.timestamp >= cutoffDate);

      // Calculate overview metrics
      const overview = this.calculateOverview(userEntries, userGoals);
      
      // Generate trends
      const trends = this.calculateTrends(recentEntries, days);
      
      // Get insights
      const insights = this.generateInsights(recentEntries, trends, userGoals);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(trends, userGoals, insights);

      const dashboard: ProgressDashboard = {
        overview,
        recentEntries: recentEntries.slice(-10), // Last 10 entries
        trends,
        goals: userGoals,
        insights,
        recommendations
      };

      const duration = Date.now() - startTime;
      loggingService.logPerformance('ProgressTracking', 'getProgressDashboard', duration, {
        entriesCount: recentEntries.length,
        goalsCount: userGoals.length
      });

      return dashboard;

    } catch (error) {
      loggingService.error(
        'ProgressTracking',
        'Failed to generate progress dashboard',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to generate progress dashboard');
    }
  }

  /**
   * Create wellness goal
   */
  async createWellnessGoal(goal: Omit<WellnessGoal, 'id' | 'progress'>): Promise<string> {
    try {
      const wellnessGoal: WellnessGoal = {
        ...goal,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        progress: this.calculateGoalProgress(goal.currentValue, goal.targetValue)
      };

      const userGoals = this.wellnessGoals.get(goal.userId) || [];
      userGoals.push(wellnessGoal);
      this.wellnessGoals.set(goal.userId, userGoals);

      loggingService.info('ProgressTracking', 'Wellness goal created', {
        userId: goal.userId,
        goalType: goal.category,
        targetMetric: goal.targetMetric
      });

      return wellnessGoal.id;

    } catch (error) {
      loggingService.error(
        'ProgressTracking',
        'Failed to create wellness goal',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to create wellness goal');
    }
  }

  /**
   * Get symptom severity trends
   */
  async getSymptomTrends(userId: string, symptomId: string, days: number = 30): Promise<{
    data: { date: string; value: number; notes?: string }[];
    trend: ProgressTrend;
    recommendations: string[];
  }> {
    try {
      const userEntries = this.progressEntries.get(userId) || [];
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const symptomEntries = userEntries
        .filter(entry => entry.metricId === symptomId && entry.timestamp >= cutoffDate)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const data = symptomEntries.map(entry => ({
        date: entry.timestamp.toISOString().split('T')[0],
        value: entry.value,
        notes: entry.notes
      }));

      const trend = this.calculateTrend(symptomEntries, symptomId);
      const recommendations = this.generateSymptomRecommendations(trend, symptomEntries);

      return { data, trend, recommendations };

    } catch (error) {
      loggingService.error(
        'ProgressTracking',
        'Failed to get symptom trends',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to get symptom trends');
    }
  }

  /**
   * Initialize health metrics
   */
  private initializeMetrics(): void {
    const metrics: HealthMetric[] = [
      // Symptom metrics
      {
        id: 'pain_severity',
        name: 'Intensidad del Dolor',
        category: 'symptom',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Nivel de dolor general del 1 al 10',
        mexicanContext: 'Considera factores como cambios de clima y altitud'
      },
      {
        id: 'headache_frequency',
        name: 'Frecuencia de Dolores de Cabeza',
        category: 'symptom',
        unit: 'episodios por semana',
        scale: { min: 0, max: 14, type: 'frequency' },
        description: 'Número de dolores de cabeza por semana'
      },
      {
        id: 'fatigue_level',
        name: 'Nivel de Fatiga',
        category: 'symptom',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Sensación de cansancio y falta de energía',
        mexicanContext: 'La altitud de ciudades como CDMX puede influir'
      },
      {
        id: 'anxiety_level',
        name: 'Nivel de Ansiedad',
        category: 'symptom',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Nivel de ansiedad o nerviosismo'
      },
      {
        id: 'digestive_comfort',
        name: 'Comodidad Digestiva',
        category: 'symptom',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Qué tan cómodo se siente tu sistema digestivo',
        mexicanContext: 'Considera efectos de comida picante y especias'
      },

      // Vital signs
      {
        id: 'blood_pressure_systolic',
        name: 'Presión Sistólica',
        category: 'vital',
        unit: 'mmHg',
        scale: { min: 90, max: 200, type: 'numeric' },
        description: 'Presión arterial sistólica'
      },
      {
        id: 'weight',
        name: 'Peso',
        category: 'vital',
        unit: 'kg',
        scale: { min: 30, max: 200, type: 'numeric' },
        description: 'Peso corporal'
      },
      {
        id: 'sleep_quality',
        name: 'Calidad del Sueño',
        category: 'lifestyle',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Qué tan bien dormiste la noche pasada'
      },

      // Lifestyle metrics
      {
        id: 'exercise_minutes',
        name: 'Minutos de Ejercicio',
        category: 'lifestyle',
        unit: 'minutos',
        scale: { min: 0, max: 240, type: 'numeric' },
        description: 'Minutos de actividad física por día'
      },
      {
        id: 'water_intake',
        name: 'Consumo de Agua',
        category: 'lifestyle',
        unit: 'vasos',
        scale: { min: 0, max: 15, type: 'numeric' },
        description: 'Vasos de agua consumidos por día',
        mexicanContext: 'Especialmente importante en clima seco mexicano'
      },
      {
        id: 'meditation_minutes',
        name: 'Meditación/Relajación',
        category: 'lifestyle',
        unit: 'minutos',
        scale: { min: 0, max: 120, type: 'numeric' },
        description: 'Tiempo dedicado a meditación o relajación'
      },

      // Constitutional metrics
      {
        id: 'vata_balance',
        name: 'Balance Vata',
        category: 'constitutional',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Qué tan equilibrado sientes tu energía Vata (aire)'
      },
      {
        id: 'pitta_balance',
        name: 'Balance Pitta',
        category: 'constitutional',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Qué tan equilibrado sientes tu energía Pitta (fuego)'
      },
      {
        id: 'kapha_balance',
        name: 'Balance Kapha',
        category: 'constitutional',
        unit: 'escala 1-10',
        scale: { min: 1, max: 10, type: 'severity' },
        description: 'Qué tan equilibrado sientes tu energía Kapha (tierra)'
      }
    ];

    metrics.forEach(metric => {
      this.healthMetrics.set(metric.id, metric);
    });
  }

  /**
   * Initialize mock data for demonstration
   */
  private initializeMockData(): void {
    const demoUserId = 'demo_user_123';
    
    // Generate mock progress entries
    const mockEntries: ProgressEntry[] = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      mockEntries.push({
        id: `entry_${i}`,
        userId: demoUserId,
        metricId: 'pain_severity',
        value: Math.max(1, Math.floor(Math.random() * 6) + Math.max(0, i - 20)), // Improving trend
        timestamp: date,
        notes: i % 5 === 0 ? 'Día particularmente bueno/malo' : undefined,
        contextData: {
          mood: Math.floor(Math.random() * 5) + 5,
          stressLevel: Math.floor(Math.random() * 7) + 2
        }
      });
    }

    this.progressEntries.set(demoUserId, mockEntries);

    // Mock wellness goals
    const mockGoals: WellnessGoal[] = [
      {
        id: 'goal_1',
        userId: demoUserId,
        title: 'Reducir Dolor de Cabeza',
        description: 'Reducir la frecuencia de dolores de cabeza a máximo 2 por semana',
        targetMetric: 'headache_frequency',
        targetValue: 2,
        currentValue: 4,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        category: 'symptom_reduction',
        progress: 50,
        milestones: [
          { value: 5, label: 'Primera mejora', achieved: true, achievedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { value: 3, label: 'Mejora significativa', achieved: false },
          { value: 2, label: 'Meta alcanzada', achieved: false }
        ],
        mexicanCulturalNotes: [
          'Considera el efecto de la altitud en CDMX',
          'Evita deshidratación común en clima seco mexicano'
        ]
      }
    ];

    this.wellnessGoals.set(demoUserId, mockGoals);
  }

  /**
   * Calculate overview metrics
   */
  private calculateOverview(entries: ProgressEntry[], goals: WellnessGoal[]) {
    const uniqueMetrics = new Set(entries.map(e => e.metricId)).size;
    const activeGoals = goals.filter(g => g.deadline > new Date()).length;
    
    // Calculate improving trends (simplified)
    const recentEntries = entries.slice(-7); // Last 7 entries
    const olderEntries = entries.slice(-14, -7); // Previous 7 entries
    
    const recentAvg = recentEntries.reduce((sum, e) => sum + e.value, 0) / recentEntries.length || 0;
    const olderAvg = olderEntries.reduce((sum, e) => sum + e.value, 0) / olderEntries.length || 0;
    
    const improvingTrends = recentAvg < olderAvg ? 1 : 0; // Simplified

    // Calculate streak (days with entries)
    const today = new Date().toDateString();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
      const hasEntry = entries.some(e => e.timestamp.toDateString() === checkDate);
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalMetrics: uniqueMetrics,
      activeGoals,
      improvingTrends,
      daysTracked: new Set(entries.map(e => e.timestamp.toDateString())).size,
      currentStreak: streak
    };
  }

  /**
   * Calculate trends for metrics
   */
  private calculateTrends(entries: ProgressEntry[], days: number): ProgressTrend[] {
    const metricGroups = new Map<string, ProgressEntry[]>();
    
    // Group entries by metric
    entries.forEach(entry => {
      const group = metricGroups.get(entry.metricId) || [];
      group.push(entry);
      metricGroups.set(entry.metricId, group);
    });

    const trends: ProgressTrend[] = [];

    metricGroups.forEach((metricEntries, metricId) => {
      const trend = this.calculateTrend(metricEntries, metricId);
      trends.push(trend);
    });

    return trends;
  }

  /**
   * Calculate individual trend
   */
  private calculateTrend(entries: ProgressEntry[], metricId: string): ProgressTrend {
    if (entries.length < 2) {
      return {
        metricId,
        direction: 'stable',
        changePercentage: 0,
        period: 'weekly',
        significance: 'low',
        insights: ['No hay suficientes datos para determinar tendencia']
      };
    }

    const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2));
    const secondHalf = sortedEntries.slice(Math.floor(sortedEntries.length / 2));

    const firstAvg = firstHalf.reduce((sum, e) => sum + e.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.value, 0) / secondHalf.length;

    const changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    const direction = Math.abs(changePercentage) < 5 ? 'stable' : 
                     changePercentage > 0 ? 'worsening' : 'improving';

    const significance = Math.abs(changePercentage) > 20 ? 'high' :
                        Math.abs(changePercentage) > 10 ? 'medium' : 'low';

    const metric = this.healthMetrics.get(metricId);
    const insights = this.generateTrendInsights(direction, changePercentage, metric);

    return {
      metricId,
      direction,
      changePercentage: Math.abs(changePercentage),
      period: 'weekly',
      significance,
      insights
    };
  }

  /**
   * Generate insights based on data
   */
  private generateInsights(entries: ProgressEntry[], trends: ProgressTrend[], goals: WellnessGoal[]) {
    const weekly: string[] = [];
    const monthly: string[] = [];
    const constitutional: string[] = [];
    const seasonal: string[] = [];

    // Weekly insights
    const improvingTrends = trends.filter(t => t.direction === 'improving').length;
    const worseningTrends = trends.filter(t => t.direction === 'worsening').length;

    if (improvingTrends > worseningTrends) {
      weekly.push('Tu progreso general muestra una tendencia positiva esta semana');
    } else if (worseningTrends > improvingTrends) {
      weekly.push('Algunos síntomas han empeorado. Considera revisar tu rutina');
    }

    // Monthly insights
    monthly.push('Análisis mensual muestra patrones de mejora en el manejo del dolor');

    // Constitutional insights
    const vataEntries = entries.filter(e => e.metricId === 'vata_balance');
    if (vataEntries.length > 0) {
      const avgVata = vataEntries.reduce((sum, e) => sum + e.value, 0) / vataEntries.length;
      if (avgVata < 5) {
        constitutional.push('Tu energía Vata parece desequilibrada. Considera rutinas más estables');
      }
    }

    // Seasonal insights
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) {
      seasonal.push('Durante la temporada de lluvias, mantén especial atención a la humedad y ejercicio en interiores');
    } else {
      seasonal.push('En época seca, incrementa hidratación y protege la piel');
    }

    return { weekly, monthly, constitutional, seasonal };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(trends: ProgressTrend[], goals: WellnessGoal[], insights: any) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate recommendations based on trends
    const worseningTrends = trends.filter(t => t.direction === 'worsening' && t.significance === 'high');
    if (worseningTrends.length > 0) {
      immediate.push('Consulta con un profesional de la salud sobre el empeoramiento reciente');
      immediate.push('Revisa cambios recientes en dieta, sueño o estrés');
    }

    // Short-term recommendations
    shortTerm.push('Establece recordatorios diarios para seguimiento de síntomas');
    shortTerm.push('Incrementa actividad física gradualmente');

    // Long-term recommendations
    longTerm.push('Desarrolla un plan integral de bienestar con objetivos específicos');
    longTerm.push('Considera análisis constitucional para personalizar tu tratamiento');

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Helper methods
   */
  private calculateGoalProgress(current: number, target: number): number {
    if (target === 0) return 100;
    return Math.min(100, Math.max(0, (current / target) * 100));
  }

  private generateTrendInsights(direction: string, changePercentage: number, metric?: HealthMetric): string[] {
    const insights: string[] = [];

    if (direction === 'improving') {
      insights.push(`${metric?.name || 'Esta métrica'} ha mejorado ${changePercentage.toFixed(1)}%`);
      if (metric?.mexicanContext) {
        insights.push(metric.mexicanContext);
      }
    } else if (direction === 'worsening') {
      insights.push(`${metric?.name || 'Esta métrica'} ha empeorado ${changePercentage.toFixed(1)}%`);
      insights.push('Considera revisar factores como estrés, sueño y alimentación');
    } else {
      insights.push(`${metric?.name || 'Esta métrica'} se mantiene estable`);
    }

    return insights;
  }

  private generateSymptomRecommendations(trend: ProgressTrend, entries: ProgressEntry[]): string[] {
    const recommendations: string[] = [];

    if (trend.direction === 'improving') {
      recommendations.push('Continúa con tu rutina actual, está funcionando bien');
      recommendations.push('Documenta qué cambios específicos han ayudado');
    } else if (trend.direction === 'worsening') {
      recommendations.push('Identifica posibles desencadenantes recientes');
      recommendations.push('Considera técnicas de manejo del estrés');
      recommendations.push('Evalúa cambios en dieta, sueño o actividad física');
    }

    // Context-based recommendations
    const hasStressContext = entries.some(e => e.contextData?.stressLevel && e.contextData.stressLevel > 7);
    if (hasStressContext) {
      recommendations.push('Los altos niveles de estrés pueden estar influyendo. Practica técnicas de relajación');
    }

    return recommendations;
  }
}

export const progressTrackingService = ProgressTrackingService.getInstance();