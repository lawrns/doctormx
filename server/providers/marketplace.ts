import { supabase } from '../lib/supabase.js';

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: 'supplements' | 'medical_devices' | 'health_monitoring' | 'fitness_equipment' | 'wellness' | 'books';
  subcategory: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  images: string[];
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  specifications: {
    [key: string]: string;
  };
  benefits: string[];
  ingredients?: string[];
  dosage?: string;
  sideEffects?: string[];
  contraindications?: string[];
  seller: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrder {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }[];
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: {
    id: string;
    name: string;
    description: string;
  }[];
  productCount: number;
  isActive: boolean;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'supplements',
    name: 'Suplementos',
    description: 'Vitaminas, minerales y suplementos nutricionales',
    icon: '💊',
    subcategories: [
      { id: 'vitamins', name: 'Vitaminas', description: 'Vitaminas esenciales' },
      { id: 'minerals', name: 'Minerales', description: 'Minerales y oligoelementos' },
      { id: 'protein', name: 'Proteínas', description: 'Suplementos de proteína' },
      { id: 'omega3', name: 'Omega-3', description: 'Ácidos grasos esenciales' },
      { id: 'probiotics', name: 'Probióticos', description: 'Bacterias beneficiosas' }
    ],
    productCount: 0,
    isActive: true
  },
  {
    id: 'medical_devices',
    name: 'Dispositivos Médicos',
    description: 'Equipos y dispositivos para monitoreo de salud',
    icon: '🩺',
    subcategories: [
      { id: 'blood_pressure', name: 'Tensiómetros', description: 'Medidores de presión arterial' },
      { id: 'glucose_meters', name: 'Glucómetros', description: 'Medidores de glucosa' },
      { id: 'thermometers', name: 'Termómetros', description: 'Medidores de temperatura' },
      { id: 'pulse_oximeters', name: 'Oxímetros', description: 'Medidores de oxígeno' },
      { id: 'scales', name: 'Básculas', description: 'Básculas inteligentes' }
    ],
    productCount: 0,
    isActive: true
  },
  {
    id: 'health_monitoring',
    name: 'Monitoreo de Salud',
    description: 'Dispositivos wearables y apps de salud',
    icon: '⌚',
    subcategories: [
      { id: 'fitness_trackers', name: 'Rastreadores', description: 'Rastreadores de actividad' },
      { id: 'smartwatches', name: 'Smartwatches', description: 'Relojes inteligentes' },
      { id: 'sleep_monitors', name: 'Monitores de Sueño', description: 'Dispositivos para el sueño' },
      { id: 'heart_rate', name: 'Frecuencia Cardíaca', description: 'Monitores de ritmo cardíaco' }
    ],
    productCount: 0,
    isActive: true
  },
  {
    id: 'fitness_equipment',
    name: 'Equipos de Fitness',
    description: 'Equipos para ejercicio y entrenamiento',
    icon: '🏋️‍♂️',
    subcategories: [
      { id: 'home_gym', name: 'Gimnasio en Casa', description: 'Equipos para casa' },
      { id: 'cardio', name: 'Cardio', description: 'Equipos cardiovasculares' },
      { id: 'strength', name: 'Fuerza', description: 'Equipos de fuerza' },
      { id: 'yoga', name: 'Yoga', description: 'Accesorios de yoga' }
    ],
    productCount: 0,
    isActive: true
  },
  {
    id: 'wellness',
    name: 'Bienestar',
    description: 'Productos para relajación y bienestar',
    icon: '🧘‍♀️',
    subcategories: [
      { id: 'aromatherapy', name: 'Aromaterapia', description: 'Aceites esenciales' },
      { id: 'massage', name: 'Masaje', description: 'Productos de masaje' },
      { id: 'meditation', name: 'Meditación', description: 'Accesorios de meditación' },
      { id: 'sleep_aids', name: 'Ayudas para el Sueño', description: 'Productos para dormir' }
    ],
    productCount: 0,
    isActive: true
  },
  {
    id: 'books',
    name: 'Libros de Salud',
    description: 'Libros y guías de salud y bienestar',
    icon: '📚',
    subcategories: [
      { id: 'nutrition', name: 'Nutrición', description: 'Libros de nutrición' },
      { id: 'fitness', name: 'Fitness', description: 'Libros de ejercicio' },
      { id: 'mental_health', name: 'Salud Mental', description: 'Libros de bienestar mental' },
      { id: 'medical', name: 'Médicos', description: 'Libros médicos' }
    ],
    productCount: 0,
    isActive: true
  }
];

export async function getMarketplaceProducts(
  category?: string,
  subcategory?: string,
  search?: string,
  minPrice?: number,
  maxPrice?: number,
  rating?: number,
  sortBy: 'price' | 'rating' | 'newest' | 'popular' = 'popular',
  limit: number = 20,
  offset: number = 0
): Promise<MarketplaceProduct[]> {
  try {
    let query = supabase
      .from('marketplace_products')
      .select(`
        *,
        sellers!inner(name, verified, rating)
      `)
      .eq('is_available', true)
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    if (rating !== undefined) {
      query = query.gte('rating', rating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        query = query.order('price', { ascending: true });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('review_count', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting marketplace products:', error);
    throw error;
  }
}

export async function getProductById(productId: string): Promise<MarketplaceProduct | null> {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        sellers!inner(name, verified, rating)
      `)
      .eq('id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw error;
  }
}

export async function getProductReviews(productId: string, limit: number = 10): Promise<MarketplaceReview[]> {
  try {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .select(`
        *,
        users!inner(name, avatar_url)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting product reviews:', error);
    throw error;
  }
}

export async function addProductReview(
  productId: string,
  userId: string,
  rating: number,
  title: string,
  content: string,
  images?: string[]
): Promise<MarketplaceReview> {
  try {
    const { data, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        title,
        content,
        images: images || [],
        verified: false,
        helpful: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update product rating
    await updateProductRating(productId);

    return data;
  } catch (error) {
    console.error('Error adding product review:', error);
    throw error;
  }
}

export async function updateProductRating(productId: string): Promise<void> {
  try {
    // Get all reviews for the product
    const { data: reviews, error } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    if (!reviews || reviews.length === 0) return;

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update product
    await supabase
      .from('marketplace_products')
      .update({
        rating: Math.round(averageRating * 10) / 10,
        review_count: reviews.length
      })
      .eq('id', productId);
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
}

export async function createOrder(
  userId: string,
  items: any[],
  shippingAddress: any,
  paymentMethod: string
): Promise<MarketplaceOrder> {
  try {
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const { data, error } = await supabase
      .from('marketplace_orders')
      .insert({
        user_id: userId,
        items,
        total,
        currency: 'MXN',
        status: 'pending',
        payment_method: paymentMethod,
        shipping_address: shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update product stock
    for (const item of items) {
      await supabase
        .from('marketplace_products')
        .update({ stock: supabase.raw('stock - ?', [item.quantity]) })
        .eq('id', item.productId);
    }

    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<MarketplaceOrder[]> {
  try {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<MarketplaceOrder> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    const { data, error } = await supabase
      .from('marketplace_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getFeaturedProducts(limit: number = 8): Promise<MarketplaceProduct[]> {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        sellers!inner(name, verified, rating)
      `)
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw error;
  }
}

export async function getRecommendedProducts(userId: string, limit: number = 8): Promise<MarketplaceProduct[]> {
  try {
    // Get user's order history to determine preferences
    const { data: orders } = await supabase
      .from('marketplace_orders')
      .select('items')
      .eq('user_id', userId)
      .eq('status', 'delivered');

    if (!orders || orders.length === 0) {
      // Return popular products if no order history
      return getFeaturedProducts(limit);
    }

    // Extract categories from user's purchases
    const purchasedCategories = new Set();
    orders.forEach(order => {
      order.items.forEach(item => {
        purchasedCategories.add(item.category);
      });
    });

    // Get products from similar categories
    const { data, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        sellers!inner(name, verified, rating)
      `)
      .in('category', Array.from(purchasedCategories))
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting recommended products:', error);
    throw error;
  }
}

export async function searchProducts(query: string, limit: number = 20): Promise<MarketplaceProduct[]> {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select(`
        *,
        sellers!inner(name, verified, rating)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%,tags.cs.{${query}}`)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

export function getAllCategories(): MarketplaceCategory[] {
  return MARKETPLACE_CATEGORIES;
}

export function getCategoryById(categoryId: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find(c => c.id === categoryId);
}
