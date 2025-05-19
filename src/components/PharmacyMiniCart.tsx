import React from 'react';
import { ShoppingCart } from 'lucide-react';

export interface PharmacyProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;        // in MXN
  discount?: number;    // percentage discount, e.g., 10 for 10%
}

interface PharmacyMiniCartProps {
  products?: PharmacyProduct[];
  onAdd?: (product: PharmacyProduct) => void;
  onCheckout?: () => void;
}

const DEFAULT_PRODUCTS: PharmacyProduct[] = [
  { id: '1', name: 'Paracetamol 500mg', imageUrl: '/images/paracetamol.png', price: 50, discount: 5 },
  { id: '2', name: 'Ibuprofeno 400mg', imageUrl: '/images/ibuprofen.png', price: 75, discount: 10 },
  { id: '3', name: 'Vitamina C 1000mg', imageUrl: '/images/vitamin-c.png', price: 120, discount: 0 },
  { id: '4', name: 'Omeprazol 20mg', imageUrl: '/images/omeprazol.png', price: 90, discount: 15 }
];

const PharmacyMiniCart: React.FC<PharmacyMiniCartProps> = ({ products = DEFAULT_PRODUCTS, onAdd, onCheckout }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-2">Farmacia</h4>
      <div className="flex overflow-x-auto space-x-4 px-1 snap-x snap-mandatory">
        {products.map(product => (
          <div key={product.id} className="snap-center flex-shrink-0 w-40 bg-white rounded-lg shadow p-3">
            <img src={product.imageUrl} alt={product.name} className="h-24 w-full object-contain mb-2" />
            <div className="text-sm font-medium text-gray-900 truncate mb-1">{product.name}</div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-lg font-semibold text-teal-600">
                ${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => onAdd && onAdd(product)}
              className="mt-auto w-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-1 rounded"
            >
              <ShoppingCart size={16} className="mr-1" /> Agregar
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-3 px-1">
        <button
          onClick={() => onCheckout && onCheckout()}
          className="bg-coral-500 hover:bg-coral-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
        >
          Pagar ahora
        </button>
      </div>
    </div>
  );
};

export default PharmacyMiniCart;