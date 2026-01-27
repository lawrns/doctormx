// src/services/pharmacy-api.ts
// Mock pharmacy API service for connecting to real pharmacy systems

export interface PharmacyProduct {
  id: string;
  name: string;
  price: number;
  pharmacy: string;
  deliveryTime: string;
  stock: number;
  prescriptionRequired: boolean;
}

export interface OrderRequest {
  productId: string;
  quantity: number;
  patientId: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
}

export interface OrderResponse {
  orderId: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery: string;
  totalAmount: number;
  trackingNumber?: string;
}

class PharmacyAPIService {
  private baseUrl: string = 'https://api.farmacias-example.com'; // Replace with real API
  
  async searchProducts(medicationName: string): Promise<PharmacyProduct[]> {
    // In a real implementation, this would call the actual pharmacy API
    // For now, we'll return mock data based on the medication name
    return this.getMockProducts(medicationName);
  }
  
  async placeOrder(order: OrderRequest): Promise<OrderResponse> {
    // In a real implementation, this would call the actual pharmacy API
    // to place the order and return the response
    return this.mockPlaceOrder(order);
  }
  
  async getOrderStatus(orderId: string): Promise<OrderResponse> {
    // In a real implementation, this would fetch the order status
    return this.mockGetOrderStatus(orderId);
  }
  
  private getMockProducts(medicationName: string): PharmacyProduct[] {
    // Mock data for demonstration purposes
    const mockProducts: Record<string, PharmacyProduct[]> = {
      'Tempra': [
        {
          id: 'tempra-500mg',
          name: 'Tempra 500mg Tabletas',
          price: 45.50,
          pharmacy: 'Farmacias Guadalajara',
          deliveryTime: '2-4 horas',
          stock: 15,
          prescriptionRequired: false
        },
        {
          id: 'tempra-650mg',
          name: 'Tempra 650mg Tabletas',
          price: 52.30,
          pharmacy: 'Farmacias del Ahorro',
          deliveryTime: '1-2 horas',
          stock: 8,
          prescriptionRequired: false
        }
      ],
      'Advil': [
        {
          id: 'advil-200mg',
          name: 'Advil 200mg (12 tabletas)',
          price: 38.90,
          pharmacy: 'Farmacias Similares',
          deliveryTime: '1 hora',
          stock: 20,
          prescriptionRequired: false
        }
      ],
      'Tabcin': [
        {
          id: 'tabcin-original',
          name: 'Tabcin Original',
          price: 28.75,
          pharmacy: 'Farmacias Benavides',
          deliveryTime: '2 horas',
          stock: 12,
          prescriptionRequired: false
        },
        {
          id: 'tabcin-plus',
          name: 'Tabcin Plus',
          price: 35.20,
          pharmacy: 'Farmacias San Pablo',
          deliveryTime: '2-4 horas',
          stock: 5,
          prescriptionRequired: false
        }
      ],
      'Pepto-Bismol': [
        {
          id: 'pepto-liquido',
          name: 'Pepto-Bismol Líquido 118ml',
          price: 42.50,
          pharmacy: 'Farmacias Yza',
          deliveryTime: '1-2 horas',
          stock: 7,
          prescriptionRequired: false
        }
      ]
    };
    
    return mockProducts[medicationName] || [];
  }
  
  private mockPlaceOrder(order: OrderRequest): Promise<OrderResponse> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `ORD-${Date.now()}`,
          status: 'confirmed',
          estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          totalAmount: 45.50, // This would be calculated based on actual products
          trackingNumber: `TRK${Math.floor(100000 + Math.random() * 900000)}`
        });
      }, 1000); // Simulate network delay
    });
  }
  
  private mockGetOrderStatus(orderId: string): Promise<OrderResponse> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId,
          status: 'processing',
          estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          totalAmount: 45.50,
          trackingNumber: orderId.replace('ORD-', 'TRK')
        });
      }, 500); // Simulate network delay
    });
  }
}

export const pharmacyAPI = new PharmacyAPIService();