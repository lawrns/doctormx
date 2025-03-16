
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';

// Import components
import ConnectHeroSection from './components/ConnectHeroSection';
import ConnectStatsSection from './components/ConnectStatsSection';
import ConnectFeaturesSection from './components/ConnectFeaturesSection';
import ConnectComparisonTable from './components/ConnectComparisonTable';
import ConnectTestimonials from './components/ConnectTestimonials';
import ConnectRegistrationSteps from './components/ConnectRegistrationSteps';
import ConnectPricingPlans from './components/ConnectPricingPlans';
import ConnectFAQSection from './components/ConnectFAQSection';
import ConnectCTASection from './components/ConnectCTASection';

const ConnectLandingPage = () => {
  const { supabase } = useSupabase();
  const { referralId } = useParams();
  const [searchParams] = useSearchParams();
  const [referrerInfo, setReferrerInfo] = useState<{ name?: string; specialty?: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorsJoined, setDoctorsJoined] = useState(0);

  // Get referrer from URL params or referral ID
  useEffect(() => {
    const getReferrer = async () => {
      setIsLoading(true);
      try {
        const refId = referralId || searchParams.get('ref');
        if (refId) {
          // Fetch referrer info from the database
          const { data, error } = await supabase
            .from('referral_links')
            .select('doctors(name, specialty)')
            .eq('id', refId)
            .single();

          if (error) throw error;
          
          if (data?.doctors) {
            setReferrerInfo({
              name: data.doctors.name,
              specialty: data.doctors.specialty
            });
          }
        }
        
        // Get count of doctors who joined through referrals
        const { count, error: countError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true })
          .eq('joined_via_referral', true);
          
        if (!countError && count !== null) {
          setDoctorsJoined(count);
        }
      } catch (error) {
        console.error('Error fetching referrer info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getReferrer();
  }, [referralId, searchParams, supabase]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ConnectHeroSection 
        referralId={referralId} 
        referrerInfo={referrerInfo} 
        doctorsJoined={doctorsJoined}
      />
      
      {/* Special Offer Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-20 -mr-20" />
            
            <div className="absolute top-4 right-8 bg-white text-blue-600 font-bold py-1 px-4 rounded-full transform rotate-3 shadow-md">
              6 MESES GRATIS
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Oferta Especial para Nuevos Proveedores</h2>
              <p className="text-xl text-blue-100 mb-6">
                ¡Únase a nuestra red de élite a través del programa Doctor.mx/Connect y disfrute de 6 meses de servicio completamente gratuito!
              </p>
              <p className="text-blue-100 mb-6">
                Estamos buscando profesionales de la salud comprometidos para formar parte de nuestra revolucionaria plataforma de atención médica. El programa Connect le ofrece acceso exclusivo a todas nuestras funciones premium sin costo durante sus primeros 6 meses.
              </p>
            </div>
          </div>
          
          <ConnectStatsSection />
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectFeaturesSection />
          <ConnectTestimonials />
        </div>
      </div>
      
      {/* Comparison Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectComparisonTable />
        </div>
      </div>
      
      {/* Registration Steps */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectRegistrationSteps />
          <ConnectTestimonials />
        </div>
      </div>
      
      {/* Pricing Plans */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectPricingPlans />
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectFAQSection />
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ConnectCTASection referralId={referralId} />
        </div>
      </div>
    </div>
  );
};

export default ConnectLandingPage;
