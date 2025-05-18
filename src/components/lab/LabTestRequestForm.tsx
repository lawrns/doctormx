import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { fetchLabTests, LabTest } from '../../services/labTestingService';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

interface TestRequestData {
  tests: string[];
  instructions: string;
}

interface Props {
  onSubmit: (data: TestRequestData) => void;
  initialData?: TestRequestData | null;
}

const LabTestRequestForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [tests, setTests] = useState<string[]>(initialData?.tests || []);
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [testOptions, setTestOptions] = useState<LabTest[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Popular packages
  const packages = [
    {
      id: 'basic',
      name: 'Perfil Básico',
      description: 'Hemograma completo, glucosa y perfil lipídico',
      tests: ['hemograma-completo', 'quimica-sanguinea', 'perfil-lipidico'],
      price: 400
    },
    {
      id: 'advanced',
      name: 'Perfil Avanzado',
      description: 'Perfil básico + pruebas de función hepática y renal',
      tests: ['hemograma-completo', 'quimica-sanguinea', 'perfil-lipidico', 'prueba-orina'],
      price: 650
    },
    {
      id: 'covid',
      name: 'Perfil COVID-19',
      description: 'Prueba PCR y anticuerpos IgG e IgM',
      tests: ['covid'],
      price: 900
    }
  ];
  
  // Fetch test options from API
  useEffect(() => {
    fetchLabTests()
      .then((data) => {
        setTestOptions(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((test) => test.category || 'Sin categoría'))
        );
        setCategories(['Todas', ...uniqueCategories]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  // Calculate total amount
  useEffect(() => {
    if (tests.length === 0) {
      setTotalAmount(0);
      return;
    }
    
    const selectedTests = testOptions.filter((test) => tests.includes(test.id));
    const sum = selectedTests.reduce((acc, test) => acc + (test.price || 0), 0);
    setTotalAmount(sum);
  }, [tests, testOptions]);
  
  // Handle package selection from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const packageParam = urlParams.get('package');
    
    if (packageParam) {
      const matchedPackage = packages.find(
        (pkg) => pkg.name.toLowerCase() === packageParam.toLowerCase()
      );
      
      if (matchedPackage) {
        setSelectedPackage(matchedPackage.id);
        setTests(matchedPackage.tests);
      }
    }
  }, []);
  
  const handleTestToggle = (testId: string) => {
    setTests((prev) =>
      prev.includes(testId) ? prev.filter((t) => t !== testId) : [...prev, testId]
    );
    // Clear selected package when individual tests are selected
    setSelectedPackage(null);
  };
  
  const handlePackageSelect = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      setTests(pkg.tests);
      setSelectedPackage(packageId);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ tests, instructions });
  };
  
  const filteredTests = testOptions.filter((test) => {
    const matchesSearch = searchQuery 
      ? test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (test.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = activeCategory === 'Todas' 
      ? true 
      : (test.category || 'Sin categoría') === activeCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-3 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 font-medium">
          Error al cargar exámenes: {error}
        </p>
        <p className="text-gray-600 mt-2">
          Por favor, intenta de nuevo más tarde o contacta a soporte.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Packages section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Paquetes populares</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPackage === pkg.id
                  ? 'border-brand-jade-500 bg-brand-jade-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handlePackageSelect(pkg.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{pkg.name}</h4>
                {selectedPackage === pkg.id && (
                  <div className="w-5 h-5 bg-brand-jade-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
              <div className="text-brand-jade-600 font-bold">${pkg.price} MXN</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar exámenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="relative">
          <div className="group inline-block relative">
            <button
              type="button"
              className="px-4 py-2 border rounded-md inline-flex items-center bg-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Categoría: {activeCategory}</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block hover:block bg-white border rounded-md shadow-lg z-10 w-48">
              <div className="py-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      activeCategory === category
                        ? 'bg-brand-jade-50 text-brand-jade-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Test selection */}
      <div>
        <h3 className="text-lg font-bold mb-4">Exámenes individuales</h3>
        <div className="space-y-3">
          {filteredTests.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">
              No se encontraron exámenes que coincidan con tu búsqueda.
            </p>
          ) : (
            filteredTests.map((test) => (
              <div
                key={test.id}
                className={`border rounded-lg p-4 transition-colors ${
                  tests.includes(test.id)
                    ? 'border-brand-jade-500 bg-brand-jade-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id={test.id}
                    checked={tests.includes(test.id)}
                    onChange={() => handleTestToggle(test.id)}
                    className="h-5 w-5 text-brand-jade-600 rounded border-gray-300 focus:ring-brand-jade-500 mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <label htmlFor={test.id} className="block font-medium text-gray-900 cursor-pointer">
                      {test.name}
                      {test.price != null && (
                        <span className="text-brand-jade-600 float-right font-bold">
                          ${test.price} MXN
                        </span>
                      )}
                    </label>
                    {test.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {test.description}
                      </p>
                    )}
                    {tests.includes(test.id) && test.instructions && (
                      <div className="mt-2 text-sm bg-brand-jade-50 p-3 rounded border border-brand-jade-100">
                        <p className="font-medium text-brand-jade-800">Instrucciones:</p>
                        <p className="text-gray-700">{test.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Total amount */}
      {totalAmount > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total:</span>
            <span className="text-2xl font-bold text-brand-jade-700">${totalAmount} MXN</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            El pago se realizará en efectivo al momento de la toma de muestras.
          </p>
        </div>
      )}
      
      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instrucciones adicionales o comentarios
        </label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full"
          placeholder="¿Alguna consideración especial que debamos tener en cuenta?"
          rows={4}
        />
      </div>
      
      {/* Submit button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={tests.length === 0}
          className={`w-full py-3 rounded-md font-medium ${
            tests.length === 0
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-brand-jade-600 hover:bg-brand-jade-700 text-white'
          }`}
        >
          {tests.length === 0 ? 'Selecciona al menos un examen' : 'Continuar con la programación'}
        </button>
      </div>
      
      {tests.length === 0 && (
        <p className="text-amber-600 text-sm text-center">
          Debes seleccionar al menos un examen para continuar.
        </p>
      )}
    </form>
  );
};

export default LabTestRequestForm;