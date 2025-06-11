import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, TrendingUp, TrendingDown, AlertTriangle, 
  Activity, Users, Shield, Thermometer, Droplets, 
  Wind, Sun, Cloud
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CommunityHealthInsightsProps {
  communityData: {
    localAlerts: string[];
    healthTrends: Array<{
      condition: string;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  onCommunityClick: () => void;
}

const COMMUNITY_METRICS = [
  {
    label: 'Calidad del Aire',
    value: 'Moderada',
    icon: Wind,
    color: 'text-yellow-600',
    status: 'warning'
  },
  {
    label: 'Índice UV',
    value: 'Alto',
    icon: Sun,
    color: 'text-orange-600',
    status: 'caution'
  },
  {
    label: 'Humedad',
    value: '68%',
    icon: Droplets,
    color: 'text-blue-600',
    status: 'normal'
  },
  {
    label: 'Temperatura',
    value: '24°C',
    icon: Thermometer,
    color: 'text-green-600',
    status: 'optimal'
  }
];

const HEALTH_PROGRAMS = [
  {
    name: 'Prevención Diabetes',
    participants: 1250,
    effectiveness: 87,
    status: 'active'
  },
  {
    name: 'Salud Cardiovascular',
    participants: 890,
    effectiveness: 92,
    status: 'active'
  },
  {
    name: 'Salud Mental Comunitaria',
    participants: 650,
    effectiveness: 78,
    status: 'expanding'
  }
];

export default function CommunityHealthInsights({ communityData, onCommunityClick }: CommunityHealthInsightsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600 bg-red-50 border-red-200';
      case 'down': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'normal': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'caution': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="p-6 space-y-6">
        {/* Community Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tu Comunidad
            </h3>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Colonia Roma Norte, CDMX
          </div>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Shield className="w-4 h-4 mr-1" />
            Zona Saludable
          </div>
        </div>

        {/* Environmental Conditions */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Cloud className="w-5 h-5 mr-2 text-blue-500" />
            Condiciones Ambientales
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {COMMUNITY_METRICS.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <metric.icon className={`w-5 h-5 mx-auto mb-1 ${metric.color}`} />
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {metric.label}
                </div>
                <div className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Health Trends */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
            Tendencias Locales
          </h4>
          
          <div className="space-y-2">
            {communityData.healthTrends.map((trend, index) => (
              <motion.div
                key={trend.condition}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${getTrendColor(trend.trend)} dark:bg-gray-800 dark:border-gray-600`}
              >
                <div className="flex items-center space-x-2">
                  {getTrendIcon(trend.trend)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {trend.condition}
                  </span>
                </div>
                
                <span className={`text-xs font-bold ${getTrendColor(trend.trend).split(' ')[0]}`}>
                  {trend.trend === 'up' ? '+12%' : trend.trend === 'down' ? '-8%' : 'Estable'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Local Alerts */}
        {communityData.localAlerts.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Alertas Locales
            </h4>
            
            <div className="space-y-2">
              {communityData.localAlerts.map((alert, index) => (
                <motion.div
                  key={alert}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700"
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <span className="text-sm text-orange-900 dark:text-orange-100">
                      {alert}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Community Health Programs */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Programas Comunitarios
          </h4>
          
          <div className="space-y-3">
            {HEALTH_PROGRAMS.slice(0, 2).map((program, index) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    {program.name}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {program.effectiveness}% efectivo
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
                  <span>{program.participants.toLocaleString()} participantes</span>
                  <span className="capitalize">{program.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Community Health Score */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                Índice de Salud Comunitaria
              </h5>
              <p className="text-xs text-purple-800 dark:text-purple-200">
                Tu comunidad está en el top 15% nacional
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">87</div>
              <div className="text-xs text-purple-600">/ 100</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          onClick={onCommunityClick}
        >
          <MapPin className="w-4 h-4 mr-2" />
          Explorar Salud Comunitaria
        </Button>
      </div>
    </Card>
  );
}