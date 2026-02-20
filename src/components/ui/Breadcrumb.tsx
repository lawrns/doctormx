import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

interface BreadcrumbMap {
  [key: string]: string;
}

const breadcrumbMap: BreadcrumbMap = {
  'doctors': 'Doctores',
  'doctor': 'Consulta IA',
  'connect': 'Para Doctores',
  'blog': 'Blog',
  'expert-qa': 'Preguntas',
  'faq': 'FAQ',
  'dashboard': 'Panel',
  'vision': 'Análisis de Imágenes',
  'community': 'Comunidad',
  'marketplace': 'Marketplace',
  'gamification': 'Gamificación',
  'affiliate': 'Afiliados',
  'subscriptions': 'Suscripciones',
  'doctor-panel': 'Panel Doctor',
  'ai-referrals': 'Referencias IA',
  'qa': 'Preguntas y Respuestas',
  'doctor-dashboard': 'Panel Doctor'
};

const getBreadcrumbName = (pathname: string): string => {
  return breadcrumbMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x: string) => x);

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-4" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-primary-600 transition-colors">
        <Icon name="home" size="sm" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={name} className="flex items-center space-x-2">
            <Icon name="chevron-right" size="xs" className="text-neutral-400" />
            {isLast ? (
              <span className="text-neutral-900 font-medium">
                {getBreadcrumbName(name)}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-primary-600 transition-colors"
              >
                {getBreadcrumbName(name)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
