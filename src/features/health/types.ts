/**
 * Health data type definition for Apple HealthKit integration
 */

// Supported health metrics types
export enum HealthMetricType {
  HEART_RATE = 'heartRate',
  STEPS = 'steps',
  SLEEP = 'sleep',
  ACTIVE_ENERGY = 'activeEnergy',
  BLOOD_OXYGEN = 'bloodOxygen',
  RESTING_HEART_RATE = 'restingHeartRate',
  HEART_RATE_VARIABILITY = 'heartRateVariability',
  RESPIRATORY_RATE = 'respiratoryRate',
  WALKING_HEART_RATE = 'walkingHeartRate'
}

// Connection status for Apple Health
export enum HealthConnectionStatus {
  NOT_CONNECTED = 'notConnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

// Base interface for all health data points
export interface HealthDataPoint {
  id: string;
  type: HealthMetricType;
  startDate: string; // ISO string
  endDate: string; // ISO string
  sourceDevice?: string;
  sourceApp?: string;
}

// Heart rate data point
export interface HeartRateDataPoint extends HealthDataPoint {
  type: HealthMetricType.HEART_RATE;
  bpm: number;
}

// Blood oxygen data point
export interface BloodOxygenDataPoint extends HealthDataPoint {
  type: HealthMetricType.BLOOD_OXYGEN;
  percentage: number;
}

// Step count data point
export interface StepsDataPoint extends HealthDataPoint {
  type: HealthMetricType.STEPS;
  count: number;
}

// Sleep data point
export interface SleepDataPoint extends HealthDataPoint {
  type: HealthMetricType.SLEEP;
  sleepStages: {
    inBed: number;         // minutes
    awake: number;         // minutes
    light: number;         // minutes
    deep: number;          // minutes
    rem: number;           // minutes
  };
  totalSleepTime: number;  // minutes
  sleepQuality?: number;   // 0-100 quality score
}

// Active energy data point
export interface ActiveEnergyDataPoint extends HealthDataPoint {
  type: HealthMetricType.ACTIVE_ENERGY;
  activeKcal: number;      // kcal
}

// Heart rate variability data point
export interface HeartRateVariabilityDataPoint extends HealthDataPoint {
  type: HealthMetricType.HEART_RATE_VARIABILITY;
  sdnnMs: number;          // milliseconds
}

// Union type for all health data points
export type HealthDataPointUnion = 
  | HeartRateDataPoint
  | BloodOxygenDataPoint
  | StepsDataPoint
  | SleepDataPoint
  | ActiveEnergyDataPoint
  | HeartRateVariabilityDataPoint;

// Daily health summary
export interface DailyHealthSummary {
  date: string;            // YYYY-MM-DD
  averageHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  totalSteps?: number;
  activeKcal?: number;
  sleepDuration?: number;  // minutes
  sleepQuality?: number;   // 0-100
  averageBloodOxygen?: number;
}

// Health connection settings
export interface HealthConnectionSettings {
  status: HealthConnectionStatus;
  lastSyncTime?: string;   // ISO string
  connectedDevice?: string;
  sharedMetrics: HealthMetricType[];
  syncFrequency: 'hourly' | '4hours' | '12hours' | 'daily';
  autoSync: boolean;
}

// Health user profile
export interface HealthUserProfile {
  id: string;
  height?: number;         // cm
  weight?: number;         // kg
  birthDate?: string;      // YYYY-MM-DD
  biologicalSex?: 'male' | 'female' | 'other';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}
