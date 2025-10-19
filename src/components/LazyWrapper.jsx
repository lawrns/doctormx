import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

// Higher-order component for lazy loading with fallback
const LazyWrapper = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner text="Cargando..." />}>
      {children}
    </Suspense>
  );
};

// Lazy load page components
export const LazyDoctorDashboard = lazy(() => import('../pages/DoctorDashboard'));
export const LazyPatientDashboard = lazy(() => import('../pages/PatientDashboard'));
export const LazyDoctorDirectory = lazy(() => import('../pages/DoctorDirectory'));
export const LazyDoctorProfile = lazy(() => import('../pages/DoctorProfile'));
export const LazyDoctorSignup = lazy(() => import('../pages/DoctorSignup'));
export const LazyDoctorVerification = lazy(() => import('../pages/DoctorVerification'));
export const LazyConnectLanding = lazy(() => import('../pages/ConnectLanding'));
export const LazyPaymentCheckout = lazy(() => import('../pages/PaymentCheckout'));
export const LazyPharmacyPortal = lazy(() => import('../pages/PharmacyPortal'));
export const LazyVisionConsultation = lazy(() => import('../pages/VisionConsultation'));

// Lazy load heavy components
export const LazyGamificationDashboard = lazy(() => import('./GamificationDashboard'));
export const LazyHealthMarketplace = lazy(() => import('./HealthMarketplace'));
export const LazyQABoard = lazy(() => import('./QABoard'));
export const LazyAffiliateDashboard = lazy(() => import('./AffiliateDashboard'));
export const LazyAIReferralSystem = lazy(() => import('./AIReferralSystem'));

// Wrapped lazy components with loading states
export const DoctorDashboard = (props) => (
  <LazyWrapper>
    <LazyDoctorDashboard {...props} />
  </LazyWrapper>
);

export const PatientDashboard = (props) => (
  <LazyWrapper>
    <LazyPatientDashboard {...props} />
  </LazyWrapper>
);

export const DoctorDirectory = (props) => (
  <LazyWrapper>
    <LazyDoctorDirectory {...props} />
  </LazyWrapper>
);

export const DoctorProfile = (props) => (
  <LazyWrapper>
    <LazyDoctorProfile {...props} />
  </LazyWrapper>
);

export const DoctorSignup = (props) => (
  <LazyWrapper>
    <LazyDoctorSignup {...props} />
  </LazyWrapper>
);

export const DoctorVerification = (props) => (
  <LazyWrapper>
    <LazyDoctorVerification {...props} />
  </LazyWrapper>
);

export const ConnectLanding = (props) => (
  <LazyWrapper>
    <LazyConnectLanding {...props} />
  </LazyWrapper>
);

export const PaymentCheckout = (props) => (
  <LazyWrapper>
    <LazyPaymentCheckout {...props} />
  </LazyWrapper>
);

export const PharmacyPortal = (props) => (
  <LazyWrapper>
    <LazyPharmacyPortal {...props} />
  </LazyWrapper>
);

export const VisionConsultation = (props) => (
  <LazyWrapper>
    <LazyVisionConsultation {...props} />
  </LazyWrapper>
);

export const GamificationDashboard = (props) => (
  <LazyWrapper fallback={<LoadingSpinner text="Cargando gamificación..." />}>
    <LazyGamificationDashboard {...props} />
  </LazyWrapper>
);

export const HealthMarketplace = (props) => (
  <LazyWrapper fallback={<LoadingSpinner text="Cargando marketplace..." />}>
    <LazyHealthMarketplace {...props} />
  </LazyWrapper>
);

export const QABoard = (props) => (
  <LazyWrapper fallback={<LoadingSpinner text="Cargando Q&A..." />}>
    <LazyQABoard {...props} />
  </LazyWrapper>
);

export const AffiliateDashboard = (props) => (
  <LazyWrapper fallback={<LoadingSpinner text="Cargando afiliados..." />}>
    <LazyAffiliateDashboard {...props} />
  </LazyWrapper>
);

export const AIReferralSystem = (props) => (
  <LazyWrapper fallback={<LoadingSpinner text="Cargando IA..." />}>
    <LazyAIReferralSystem {...props} />
  </LazyWrapper>
);

export default LazyWrapper;

