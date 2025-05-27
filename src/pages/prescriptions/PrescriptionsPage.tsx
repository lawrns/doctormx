import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Select } from '../../components/ui/Select';
import { Container } from '../../components/ui/Container';
import { 
  Pill, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  Shield
} from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsRemaining: number;
  prescribedBy: string;
  prescribedDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  instructions: string;
  warnings: string[];
  interactsWith?: string[];
  isControlled: boolean;
  lastFilledDate?: Date;
  pharmacy?: {
    name: string;
    address: string;
    phone: string;
  };
}

const PrescriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [selectedTab, setSelectedTab] = useState('active');

  // Mock prescriptions data
  const mockPrescriptions: Prescription[] = [
    {
      id: '1',
      medicationName: 'Metformina',
      genericName: 'Metformin',
      dosage: '500mg',
      frequency: 'Dos veces al día',
      duration: '3 meses',
      quantity: 180,
      refillsRemaining: 2,
      prescribedBy: 'Dr. Carlos Mendoza',
      prescribedDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-04-15'),
      status: 'active',
      instructions: 'Tomar con alimentos para evitar molestias estomacales',
      warnings: ['Puede causar náuseas', 'No consumir alcohol'],
      interactsWith: ['Insulina'],
      isControlled: false,
      lastFilledDate: new Date('2024-01-16'),
      pharmacy: {
        name: 'Farmacia del Ahorro',
        address: 'Av. Insurgentes 123, CDMX',
        phone: '55-1234-5678'
      }
    },
    {
      id: '2',
      medicationName: 'Losartán',
      genericName: 'Losartan',
      dosage: '50mg',
      frequency: 'Una vez al día',
      duration: '6 meses',
      quantity: 180,
      refillsRemaining: 5,
      prescribedBy: 'Dra. Ana García',
      prescribedDate: new Date('2024-01-10'),
      expiryDate: new Date('2024-07-10'),
      status: 'active',
      instructions: 'Tomar por la mañana',
      warnings: ['Puede causar mareos', 'Evitar cambios bruscos de posición'],
      isControlled: false,
      lastFilledDate: new Date('2024-01-11')
    },
    {
      id: '3',
      medicationName: 'Paracetamol',
      genericName: 'Acetaminophen',
      dosage: '500mg',
      frequency: 'Cada 8 horas según necesidad',
      duration: '10 días',
      quantity: 30,
      refillsRemaining: 0,
      prescribedBy: 'Dr. Miguel Torres',
      prescribedDate: new Date('2023-12-20'),
      expiryDate: new Date('2024-01-20'),
      status: 'expired',
      instructions: 'No exceder 4g por día',
      warnings: ['No mezclar con alcohol'],
      isControlled: false
    }
  ];

  const [prescriptions] = useState<Prescription[]>(mockPrescriptions);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => {
      const matchesSearch = prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prescription.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
      
      const matchesTab = selectedTab === 'all' ||
                        (selectedTab === 'active' && prescription.status === 'active') ||
                        (selectedTab === 'expired' && prescription.status === 'expired') ||
                        (selectedTab === 'refillable' && prescription.refillsRemaining > 0);
      
      return matchesSearch && matchesStatus && matchesTab;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return b.prescribedDate.getTime() - a.prescribedDate.getTime();
      } else if (sortBy === 'name') {
        return a.medicationName.localeCompare(b.medicationName);
      } else if (sortBy === 'expiry') {
        return a.expiryDate.getTime() - b.expiryDate.getTime();
      }
      return 0;
    });
  }, [prescriptions, searchTerm, filterStatus, selectedTab, sortBy]);

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const refillablePrescriptions = prescriptions.filter(p => p.refillsRemaining > 0).length;
  const expiringPrescriptions = prescriptions.filter(p => {
    const daysUntilExpiry = Math.floor((p.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'expired': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const days = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleRefillRequest = (prescriptionId: string) => {
    // Navigate to refill request page
    navigate(`/prescriptions/refill/${prescriptionId}`);
  };

  const handleDownloadPrescription = (prescription: Prescription) => {
    // Mock download functionality
    console.log('Downloading prescription:', prescription.id);
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    // Mock print functionality
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Mis Recetas - DoctorMX</title>
        <meta name="description" content="Gestiona tus recetas médicas, solicita resurtidos y mantén un registro de tus medicamentos" />
      </Helmet>

      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Recetas</h1>
          <p className="text-gray-600">Gestiona tus recetas médicas y solicita resurtidos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Recetas Activas</p>
                  <p className="text-2xl font-bold text-green-800">{activePrescriptions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Con Resurtidos</p>
                  <p className="text-2xl font-bold text-blue-800">{refillablePrescriptions}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Por Vencer</p>
                  <p className="text-2xl font-bold text-yellow-800">{expiringPrescriptions}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-purple-800">{prescriptions.length}</p>
                </div>
                <Pill className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Buscar por medicamento o doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="expired">Vencidas</option>
                <option value="cancelled">Canceladas</option>
                <option value="completed">Completadas</option>
              </Select>
              <Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="date">Fecha de prescripción</option>
                <option value="name">Nombre del medicamento</option>
                <option value="expiry">Fecha de vencimiento</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs 
          tabs={[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Activas' },
            { id: 'refillable', label: 'Con Resurtidos' },
            { id: 'expired', label: 'Vencidas' }
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
          className="mb-6"
        />

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => {
            const daysUntilExpiry = getDaysUntilExpiry(prescription.expiryDate);
            const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

            return (
              <Card key={prescription.id} className={prescription.status === 'expired' ? 'opacity-75' : ''}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            {prescription.medicationName}
                            {prescription.isControlled && (
                              <Shield className="h-5 w-5 text-red-600" title="Medicamento Controlado" />
                            )}
                          </h3>
                          <p className="text-gray-600">({prescription.genericName})</p>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status === 'active' ? 'Activa' : 
                           prescription.status === 'expired' ? 'Vencida' :
                           prescription.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Dosis y Frecuencia</p>
                          <p className="font-medium">{prescription.dosage} - {prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duración</p>
                          <p className="font-medium">{prescription.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prescrito por</p>
                          <p className="font-medium">{prescription.prescribedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fecha de prescripción</p>
                          <p className="font-medium">{prescription.prescribedDate.toLocaleDateString('es-MX')}</p>
                        </div>
                      </div>

                      {isExpiringSoon && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">
                              Esta receta vence en {daysUntilExpiry} días
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Instrucciones:</p>
                        <p className="text-sm text-gray-600">{prescription.instructions}</p>
                      </div>

                      {prescription.warnings.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-red-700 mb-1">Advertencias:</p>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {prescription.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {prescription.pharmacy && (
                        <div className="text-sm text-gray-600">
                          <p>Última vez surtida: {prescription.lastFilledDate?.toLocaleDateString('es-MX')}</p>
                          <p>Farmacia: {prescription.pharmacy.name}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {prescription.quantity} unidades
                        </Badge>
                        {prescription.refillsRemaining > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {prescription.refillsRemaining} resurtidos disponibles
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
                        <Button
                          onClick={() => handleRefillRequest(prescription.id)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Solicitar Resurtido
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadPrescription(prescription)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePrintPrescription(prescription)}
                        className="flex items-center gap-2"
                      >
                        <Printer className="h-4 w-4" />
                        Imprimir
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPrescriptions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron recetas</p>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
};

export default PrescriptionsPage;