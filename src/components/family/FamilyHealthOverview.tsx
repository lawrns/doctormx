import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Heart, TrendingUp, AlertTriangle, 
  Baby, User, UserCheck, Crown, Shield 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface FamilyHealthOverviewProps {
  familyData: {
    sharedRisks: string[];
    familyScore: number;
  };
  onFamilyClick: () => void;
}

const FAMILY_MEMBERS = [
  { 
    id: 1, 
    name: 'Abuela María', 
    age: 72, 
    role: 'grandmother',
    healthStatus: 'stable', 
    conditions: ['Diabetes', 'Hipertensión'],
    icon: Crown,
    color: 'text-purple-600'
  },
  { 
    id: 2, 
    name: 'Papá Carlos', 
    age: 45, 
    role: 'father',
    healthStatus: 'good', 
    conditions: ['Sobrepeso'],
    icon: User,
    color: 'text-blue-600'
  },
  { 
    id: 3, 
    name: 'Mamá Ana', 
    age: 42, 
    role: 'mother',
    healthStatus: 'excellent', 
    conditions: [],
    icon: UserCheck,
    color: 'text-green-600'
  },
  { 
    id: 4, 
    name: 'Hijo Luis', 
    age: 8, 
    role: 'child',
    healthStatus: 'excellent', 
    conditions: [],
    icon: Baby,
    color: 'text-yellow-600'
  }
];

export default function FamilyHealthOverview({ familyData, onFamilyClick }: FamilyHealthOverviewProps) {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stable': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'concerning': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="p-6 space-y-6">
        {/* Family Health Score */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Salud Familiar
            </h3>
          </div>
          
          <div className={`text-3xl font-bold ${getScoreColor(familyData.familyScore)} mb-2`}>
            {familyData.familyScore}/100
          </div>
          
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <TrendingUp className="w-4 h-4 mr-1" />
            Salud Familiar Integrada
          </div>
        </div>

        {/* Family Members */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Miembros de la Familia
          </h4>
          
          <div className="space-y-3">
            {FAMILY_MEMBERS.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                    <member.icon className={`w-4 h-4 ${member.color}`} />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {member.age} años
                    </div>
                  </div>
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getHealthStatusColor(member.healthStatus)}`}>
                  {member.healthStatus === 'excellent' && '●'}
                  {member.healthStatus === 'good' && '○'}
                  {member.healthStatus === 'stable' && '△'}
                  {member.healthStatus === 'concerning' && '⚠'}
                  <span className="ml-1 capitalize">{member.healthStatus}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Shared Risk Factors */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-500" />
            Riesgos Compartidos
          </h4>
          
          <div className="space-y-2">
            {familyData.sharedRisks.map((risk, index) => (
              <motion.div
                key={risk}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    {risk}
                  </span>
                </div>
                
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Genético
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Family Health Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                Recomendación Familiar
              </h5>
              <p className="text-xs text-green-800 dark:text-green-200">
                Actividades familiares como caminar 30 minutos después de la cena 
                pueden reducir significativamente los riesgos compartidos de diabetes.
              </p>
            </div>
          </div>
        </div>

        {/* Family Care Coordination */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">
            Coordinación de Cuidados
          </h4>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span>Próxima cita familiar:</span>
              <span className="font-medium text-blue-600">15 Mar 2024</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Médico familiar:</span>
              <span className="font-medium text-gray-900 dark:text-white">Dr. González</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Chequeos pendientes:</span>
              <span className="font-medium text-orange-600">2 miembros</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          onClick={onFamilyClick}
        >
          <Users className="w-4 h-4 mr-2" />
          Gestionar Salud Familiar
        </Button>
      </div>
    </Card>
  );
}