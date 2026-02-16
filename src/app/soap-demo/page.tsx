import { SOAPDemo } from '@/components/soap/SOAPDemo';

export default function SOAPDemoPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SOAPDemo />
    </main>
  );
}

export const metadata = {
  title: 'Demo SOAP UI | Doctory',
  description: 'Demostración de componentes UI para consulta SOAP multi-especialista',
};
