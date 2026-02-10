/**
 * Pharmacy Configurations
 * Configuration data for supported pharmacy chains
 *
 * @module services/pharmacy/config
 */

import { PharmacyChain, PharmacyConfig } from './types';

export const PHARMACY_CONFIGS: Record<PharmacyChain, PharmacyConfig> = {
  [PharmacyChain.GUADALAJARA]: {
    id: PharmacyChain.GUADALAJARA,
    name: 'farmacias-guadalajara',
    displayName: 'Farmacias Guadalajara',
    logoUrl: 'https://www.farmaciasguadalajara.com/logo.png',
    website: 'https://www.farmaciasguadalajara.com',
    apiBaseUrl: 'https://api.farmaciasguadalajara.com/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.05,
      trackingParam: 'affiliate_id',
      baseUrl: 'https://www.farmaciasguadalajara.com/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 45,
      expressDeliveryTime: 25,
      baseCost: 49,
      expressCost: 79,
      freeDeliveryThreshold: 499,
      coverageRadiusKm: 15,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.AHORRO]: {
    id: PharmacyChain.AHORRO,
    name: 'farmacias-del-ahorro',
    displayName: 'Farmacias del Ahorro',
    logoUrl: 'https://www.farmaciasdelahorro.com/logo.png',
    website: 'https://www.farmaciasdelahorro.com',
    apiBaseUrl: 'https://api.farmaciasdelahorro.com/api',
    apiVersion: 'v2',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.045,
      trackingParam: 'ref',
      baseUrl: 'https://www.farmaciasdelahorro.com/productos',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 60,
      expressDeliveryTime: 0,
      baseCost: 39,
      expressCost: 0,
      freeDeliveryThreshold: 399,
      coverageRadiusKm: 20,
    },
    operatingHours: {
      open: '07:00',
      close: '23:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.SIMILARES]: {
    id: PharmacyChain.SIMILARES,
    name: 'farmacias-similares',
    displayName: 'Farmacias Similares',
    logoUrl: 'https://www.farmaciasdesimilares.com/logo.png',
    website: 'https://www.farmaciasdesimilares.com',
    apiBaseUrl: 'https://api.farmaciasdesimilares.com/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.03,
      trackingParam: 'afiliado',
      baseUrl: 'https://www.farmaciasdesimilares.com/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: false,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: false,
    },
    deliveryConfig: {
      baseDeliveryTime: 90,
      expressDeliveryTime: 0,
      baseCost: 29,
      expressCost: 0,
      freeDeliveryThreshold: 299,
      coverageRadiusKm: 25,
    },
    operatingHours: {
      open: '00:00',
      close: '23:59',
      open24Hours: true,
    },
  },
  [PharmacyChain.BENAVIDES]: {
    id: PharmacyChain.BENAVIDES,
    name: 'farmacias-benavides',
    displayName: 'Farmacias Benavides',
    logoUrl: 'https://www.benavides.com.mx/logo.png',
    website: 'https://www.benavides.com.mx',
    apiBaseUrl: 'https://api.benavides.com.mx/api/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.05,
      trackingParam: 'partner',
      baseUrl: 'https://www.benavides.com.mx/producto',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 50,
      expressDeliveryTime: 30,
      baseCost: 45,
      expressCost: 85,
      freeDeliveryThreshold: 449,
      coverageRadiusKm: 18,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.SAN_PABLO]: {
    id: PharmacyChain.SAN_PABLO,
    name: 'farmacias-san-pablo',
    displayName: 'Farmacias San Pablo',
    logoUrl: 'https://www.farmaciasanpablo.com.mx/logo.png',
    website: 'https://www.farmaciasanpablo.com.mx',
    apiBaseUrl: 'https://api.farmaciasanpablo.com.mx/v1',
    apiVersion: 'v1',
    affiliateProgram: {
      enabled: true,
      commissionRate: 0.04,
      trackingParam: 'aff',
      baseUrl: 'https://www.farmaciasanpablo.com.mx/productos',
    },
    features: {
      homeDelivery: true,
      expressDelivery: true,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: true,
    },
    deliveryConfig: {
      baseDeliveryTime: 40,
      expressDeliveryTime: 20,
      baseCost: 55,
      expressCost: 95,
      freeDeliveryThreshold: 599,
      coverageRadiusKm: 12,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
  [PharmacyChain.YZA]: {
    id: PharmacyChain.YZA,
    name: 'farmacias-yza',
    displayName: 'Farmacias Yza',
    logoUrl: 'https://www.yza.mx/logo.png',
    website: 'https://www.yza.mx',
    apiBaseUrl: 'https://api.yza.mx/v2',
    apiVersion: 'v2',
    affiliateProgram: {
      enabled: false,
      commissionRate: 0,
      trackingParam: '',
      baseUrl: '',
    },
    features: {
      homeDelivery: true,
      expressDelivery: false,
      prescriptionUpload: true,
      onlinePayment: true,
      cashOnDelivery: true,
      insuranceSupport: false,
    },
    deliveryConfig: {
      baseDeliveryTime: 55,
      expressDeliveryTime: 0,
      baseCost: 42,
      expressCost: 0,
      freeDeliveryThreshold: 499,
      coverageRadiusKm: 16,
    },
    operatingHours: {
      open: '08:00',
      close: '22:00',
      open24Hours: false,
    },
  },
};

/**
 * Mock pharmacy locations for delivery estimation (simplified)
 */
export const MOCK_PHARMACY_LOCATIONS: Record<PharmacyChain, { latitude: number; longitude: number }> = {
  [PharmacyChain.GUADALAJARA]: { latitude: 20.6767, longitude: -103.3475 },
  [PharmacyChain.AHORRO]: { latitude: 20.6597, longitude: -103.3496 },
  [PharmacyChain.SIMILARES]: { latitude: 20.6736, longitude: -103.4058 },
  [PharmacyChain.BENAVIDES]: { latitude: 20.6407, longitude: -103.3915 },
  [PharmacyChain.SAN_PABLO]: { latitude: 20.6919, longitude: -103.3706 },
  [PharmacyChain.YZA]: { latitude: 20.6211, longitude: -103.4186 },
};
