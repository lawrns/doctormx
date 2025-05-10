import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MapPin, Star } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  logo?: string;
  distance?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  description: string;
  price?: string;
  sponsored?: boolean;
  pharmacyId?: string;
  availableAt: string[];
}

interface ProductRecommendationProps {
  products: Product[];
  pharmacies: Record<string, Pharmacy>;
  onPharmacyClick?: (pharmacyId: string) => void;
  onProductClick?: (productId: string) => void;
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = ({
  products,
  pharmacies,
  onPharmacyClick,
  onProductClick
}) => {
  return (
    <motion.div
      className="recommendations-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h3
        className="text-lg font-medium text-gray-800 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Medicamentos Recomendados
      </motion.h3>
      
      <div className="product-carousel overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              className="product-card flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 * index }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.15)" 
              }}
              onClick={() => onProductClick && onProductClick(product.id)}
            >
              <div className="product-image relative h-40 bg-blue-50 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xl font-medium">
                      {product.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {product.sponsored && (
                  <motion.div 
                    className="pharmacy-sponsor absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 * index }}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <Star size={12} className="text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="product-details p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 * index }}
              >
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                
                {product.price && (
                  <p className="text-blue-600 font-medium mt-2">{product.price}</p>
                )}
                
                <motion.div 
                  className="pharmacy-availability mt-3 pt-3 border-t border-gray-100"
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                >
                  <p className="text-xs text-gray-500 mb-2">Disponible en:</p>
                  <div className="pharmacy-logos flex flex-wrap gap-1">
                    {product.availableAt.map(pharmId => (
                      <motion.div
                        key={pharmId}
                        className="flex items-center bg-blue-50 rounded-full px-2 py-1 text-xs"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPharmacyClick && onPharmacyClick(pharmId);
                        }}
                      >
                        <span className="text-blue-700 mr-1">{pharmacies[pharmId]?.name || 'Farmacia'}</span>
                        {pharmacies[pharmId]?.distance && (
                          <span className="flex items-center text-gray-500">
                            <MapPin size={10} className="mr-0.5" />
                            {pharmacies[pharmId].distance}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="view-more bg-blue-50 p-2 text-center text-sm text-blue-600 hover:bg-blue-100 transition-colors"
                whileHover={{ y: -2 }}
              >
                <span className="flex items-center justify-center">
                  Ver detalles
                  <ExternalLink size={12} className="ml-1" />
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductRecommendation;
