import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getBreadcrumbName = (pathname) => {
    const breadcrumbMap = {
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

    return breadcrumbMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-primary-600 transition-colors">
        <Icon name="home" size="sm" />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={name} className="flex items-center space-x-2">
            <Icon name="chevron-right" size="xs" className="text-muted-foreground" />
            {isLast ? (
              <span className="text-foreground font-medium">
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
}
