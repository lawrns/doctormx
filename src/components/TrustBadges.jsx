import React, { useState, useEffect } from 'react';
import Icon from './ui/Icon';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

const TrustBadges = ({ doctorId, showAll = false, variant = 'inline' }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [doctorId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/${doctorId}/badges`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching badges');
      }
      
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">Cargando badges...</span>
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  const getBadgeColor = (badgeType) => {
    const colors = {
      'sep_verified': 'bg-blue-100 text-blue-800 border-blue-200',
      'nom_004': 'bg-green-100 text-green-800 border-green-200',
      'nom_024': 'bg-green-100 text-green-800 border-green-200',
      'data_privacy': 'bg-purple-100 text-purple-800 border-purple-200',
      'top_rated': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'fast_responder': 'bg-green-100 text-green-800 border-green-200',
      'highly_experienced': 'bg-purple-100 text-purple-800 border-purple-200',
      'active_subscription': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'specialty_expert': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'patient_favorite': 'bg-pink-100 text-pink-800 border-pink-200',
      'compliance_champion': 'bg-red-100 text-red-800 border-red-200',
      'early_adopter': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[badgeType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getBadgeIcon = (badgeType) => {
    const icons = {
      'sep_verified': 'shield-check',
      'nom_004': 'document-text',
      'nom_024': 'document-text',
      'data_privacy': 'lock-closed',
      'top_rated': 'star',
      'fast_responder': 'bolt',
      'highly_experienced': 'academic-cap',
      'active_subscription': 'credit-card',
      'specialty_expert': 'user-group',
      'patient_favorite': 'heart',
      'compliance_champion': 'shield-check',
      'early_adopter': 'rocket-launch'
    };
    return icons[badgeType] || 'check-circle';
  };

  const getBadgeLevel = (badgeType) => {
    const levels = {
      'sep_verified': 'Verificación',
      'top_rated': 'Calidad',
      'fast_responder': 'Rendimiento',
      'highly_experienced': 'Experiencia',
      'active_subscription': 'Compromiso',
      'specialty_expert': 'Especialización',
      'patient_favorite': 'Pacientes',
      'compliance_champion': 'Cumplimiento',
      'early_adopter': 'Fundador'
    };
    return levels[badgeType] || 'General';
  };

  const formatEarnedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (variant === 'card') {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="shield-check" size="sm" color="primary" />
            Badges de Confianza
          </h3>
          {badges.length > 6 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {expanded ? 'Ver menos' : `Ver todas (${badges.length})`}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.slice(0, expanded ? badges.length : 6).map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-lg border ${getBadgeColor(badge.badge_type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon name={getBadgeIcon(badge.badge_type)} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{badge.title}</h4>
                    <span className="text-xs opacity-75">
                      {getBadgeLevel(badge.badge_type)}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mb-2">
                    {badge.description}
                  </p>
                  <div className="text-xs opacity-75">
                    Obtenido el {formatEarnedDate(badge.earned_at)}
                  </div>
                  {badge.expires_at && (
                    <div className="text-xs opacity-75">
                      Expira el {formatEarnedDate(badge.expires_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {badges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Icon name="shield-check" size="lg" color="gray" className="mx-auto mb-2" />
            <p>Sin badges de confianza aún</p>
          </div>
        )}
      </Card>
    );
  }

  // Inline variant (default)
  return (
    <div className="flex flex-wrap gap-2">
      {badges.slice(0, showAll ? badges.length : 3).map((badge) => (
        <div
          key={badge.id}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(badge.badge_type)}`}
          title={`${badge.description} - Obtenido el ${formatEarnedDate(badge.earned_at)}`}
        >
          <Icon name={getBadgeIcon(badge.badge_type)} size="xs" />
          <span>{badge.title}</span>
        </div>
      ))}
      {!showAll && badges.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
        >
          <span>{expanded ? 'Ver menos' : `+${badges.length - 3} más`}</span>
        </button>
      )}
      
      {expanded && (
        <div className="w-full mt-2 space-y-1">
          {badges.slice(3).map((badge) => (
            <div
              key={badge.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(badge.badge_type)}`}
              title={`${badge.description} - Obtenido el ${formatEarnedDate(badge.earned_at)}`}
            >
              <Icon name={getBadgeIcon(badge.badge_type)} size="xs" />
              <span>{badge.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrustBadges;