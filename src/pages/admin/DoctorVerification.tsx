import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Download, Eye, Check, X,
  Clock, AlertTriangle, FileText, Image, Shield, User,
  MapPin, Phone, Mail, Calendar, Award, Building,
  ExternalLink, MessageSquare, Stethoscope
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import SimpleTabs from '../../components/ui/SimpleTabs';

interface DoctorApplication {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    nationality: string;
    profileImage?: string;
  };
  professionalInfo: {
    licenseNumber: string;
    specialty: string;
    subSpecialties: string[];
    yearsOfExperience: number;
    currentPosition: string;
    institution: string;
    languages: string[];
  };
  education: {
    medicalSchool: string;
    graduationYear: number;
    residency?: {
      program: string;
      institution: string;
      completionYear: number;
    };
    fellowship?: {
      program: string;
      institution: string;
      completionYear: number;
    };
  };
  certifications: {
    name: string;
    issuingBody: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
  }[];
  workHistory: {
    position: string;
    institution: string;
    startDate: Date;
    endDate?: Date;
    responsibilities: string[];
  }[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    consultationAreas: string[];
  };
  documents: {
    id: string;
    type: 'medical_license' | 'medical_degree' | 'residency_certificate' | 'fellowship_certificate' | 'id_document' | 'malpractice_insurance' | 'other';
    name: string;
    url: string;
    uploadDate: Date;
    verified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
    notes?: string;
  }[];
  status: 'pending' | 'under_review' | 'verified' | 'rejected' | 'additional_info_required';
  submissionDate: Date;
  lastUpdated: Date;
  assignedReviewer?: string;
  reviewNotes?: string;
  verificationScore?: number;
  riskFlags: string[];
}

export default function DoctorVerification() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<DoctorApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  
  // Mock data - in production this would come from the API
  const [applications] = useState<DoctorApplication[]>([
    {
      id: '1',
      personalInfo: {
        firstName: 'Carlos',
        lastName: 'Mendoza García',
        email: 'cmendoza@email.com',
        phone: '+52 55 1234-5678',
        dateOfBirth: new Date('1985-03-15'),
        nationality: 'Mexicana'
      },
      professionalInfo: {
        licenseNumber: 'MEX-12345678',
        specialty: 'Cardiología',
        subSpecialties: ['Cardiología Intervencionista', 'Ecocardiografía'],
        yearsOfExperience: 8,
        currentPosition: 'Cardiólogo Adscrito',
        institution: 'Hospital General de México',
        languages: ['Español', 'Inglés']
      },
      education: {
        medicalSchool: 'Universidad Nacional Autónoma de México (UNAM)',
        graduationYear: 2010,
        residency: {
          program: 'Medicina Interna',
          institution: 'Hospital General de México',
          completionYear: 2014
        },
        fellowship: {
          program: 'Cardiología',
          institution: 'Instituto Nacional de Cardiología',
          completionYear: 2016
        }
      },
      certifications: [
        {
          name: 'Certificación en Cardiología',
          issuingBody: 'Consejo Mexicano de Cardiología',
          issueDate: new Date('2016-08-15'),
          expiryDate: new Date('2026-08-15'),
          certificateNumber: 'CMC-2016-0456'
        }
      ],
      workHistory: [
        {
          position: 'Cardiólogo Adscrito',
          institution: 'Hospital General de México',
          startDate: new Date('2016-09-01'),
          responsibilities: ['Consulta externa', 'Procedimientos invasivos', 'Supervisión de residentes']
        }
      ],
      location: {
        address: 'Dr. Balmis 148',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06726',
        consultationAreas: ['Doctores', 'Centro Histórico']
      },
      documents: [
        {
          id: 'doc1',
          type: 'medical_license',
          name: 'Cédula Profesional',
          url: '/docs/cedula-12345678.pdf',
          uploadDate: new Date('2024-02-01'),
          verified: true,
          verifiedBy: 'admin@doctormx.com',
          verificationDate: new Date('2024-02-02')
        },
        {
          id: 'doc2',
          type: 'medical_degree',
          name: 'Título de Médico Cirujano',
          url: '/docs/titulo-medicina.pdf',
          uploadDate: new Date('2024-02-01'),
          verified: true,
          verifiedBy: 'admin@doctormx.com',
          verificationDate: new Date('2024-02-02')
        },
        {
          id: 'doc3',
          type: 'fellowship_certificate',
          name: 'Certificado de Especialidad en Cardiología',
          url: '/docs/especialidad-cardiologia.pdf',
          uploadDate: new Date('2024-02-01'),
          verified: false
        }
      ],
      status: 'under_review',
      submissionDate: new Date('2024-02-01'),
      lastUpdated: new Date('2024-02-15'),
      assignedReviewer: 'admin@doctormx.com',
      verificationScore: 85,
      riskFlags: []
    },
    {
      id: '2',
      personalInfo: {
        firstName: 'Ana',
        lastName: 'Morales Vázquez',
        email: 'amorales@email.com',
        phone: '+52 55 9876-5432',
        dateOfBirth: new Date('1990-07-22'),
        nationality: 'Mexicana'
      },
      professionalInfo: {
        licenseNumber: 'MEX-87654321',
        specialty: 'Pediatría',
        subSpecialties: ['Neonatología'],
        yearsOfExperience: 5,
        currentPosition: 'Pediatra',
        institution: 'Hospital Infantil de México',
        languages: ['Español']
      },
      education: {
        medicalSchool: 'Instituto Politécnico Nacional (IPN)',
        graduationYear: 2015,
        residency: {
          program: 'Pediatría',
          institution: 'Hospital Infantil de México',
          completionYear: 2019
        }
      },
      certifications: [
        {
          name: 'Certificación en Pediatría',
          issuingBody: 'Consejo Mexicano de Pediatría',
          issueDate: new Date('2019-09-10'),
          expiryDate: new Date('2029-09-10'),
          certificateNumber: 'CMP-2019-0234'
        }
      ],
      workHistory: [
        {
          position: 'Pediatra',
          institution: 'Hospital Infantil de México',
          startDate: new Date('2019-10-01'),
          responsibilities: ['Urgencias pediátricas', 'Consulta externa', 'Hospitalización']
        }
      ],
      location: {
        address: 'Dr. Márquez 162',
        city: 'Ciudad de México',
        state: 'CDMX',
        zipCode: '06720',
        consultationAreas: ['Doctores', 'Cuauhtémoc']
      },
      documents: [
        {
          id: 'doc4',
          type: 'medical_license',
          name: 'Cédula Profesional',
          url: '/docs/cedula-87654321.pdf',
          uploadDate: new Date('2024-02-10'),
          verified: false
        },
        {
          id: 'doc5',
          type: 'medical_degree',
          name: 'Título de Médico Cirujano',
          url: '/docs/titulo-medicina-ipn.pdf',
          uploadDate: new Date('2024-02-10'),
          verified: false
        }
      ],
      status: 'pending',
      submissionDate: new Date('2024-02-10'),
      lastUpdated: new Date('2024-02-10'),
      verificationScore: 72,
      riskFlags: ['Missing documents', 'Recent graduate']
    }
  ]);

  const tabs = [
    { id: 'pending', label: 'Pendientes' },
    { id: 'under_review', label: 'En Revisión' },
    { id: 'verified', label: 'Verificados' },
    { id: 'rejected', label: 'Rechazados' }
  ];

  const specialties = [
    'Cardiología', 'Pediatría', 'Medicina General', 'Dermatología',
    'Ginecología', 'Traumatología', 'Neurología', 'Psiquiatría'
  ];

  const getStatusColor = (status: DoctorApplication['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'additional_info_required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DoctorApplication['status']) => {
    switch (status) {
      case 'verified': return Check;
      case 'under_review': return Eye;
      case 'pending': return Clock;
      case 'rejected': return X;
      case 'additional_info_required': return AlertTriangle;
      default: return Clock;
    }
  };

  const getDocumentTypeLabel = (type: DoctorApplication['documents'][0]['type']) => {
    const labels = {
      'medical_license': 'Cédula Profesional',
      'medical_degree': 'Título Médico',
      'residency_certificate': 'Certificado de Residencia',
      'fellowship_certificate': 'Certificado de Especialidad',
      'id_document': 'Identificación Oficial',
      'malpractice_insurance': 'Seguro de Responsabilidad',
      'other': 'Otro Documento'
    };
    return labels[type] || type;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = `${app.personalInfo.firstName} ${app.personalInfo.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.personalInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.professionalInfo.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || app.professionalInfo.specialty === filterSpecialty;
    const matchesTab = activeTab === 'all' || app.status === activeTab;
    
    return matchesSearch && matchesSpecialty && matchesTab;
  });

  const handleVerifyDoctor = async (applicationId: string, approved: boolean) => {
    if (!verificationNotes.trim() && !approved) {
      showToast('Por favor agrega notas para el rechazo', 'error');
      return;
    }

    try {
      // Here you would call the API to update the verification status
      showToast(`Doctor ${approved ? 'verificado' : 'rechazado'} exitosamente`, 'success');
      setShowDetailModal(false);
      setVerificationNotes('');
    } catch (error) {
      showToast('Error al procesar la verificación', 'error');
    }
  };

  const handleViewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  const handleAssignReviewer = (applicationId: string) => {
    showToast('Revisor asignado exitosamente', 'success');
  };

  return (
    <>
      <SEO 
        title="Verificación de Doctores - Admin DoctorMX"
        description="Sistema de verificación de credenciales médicas para doctores"
        keywords={['verificación doctores', 'credenciales médicas', 'admin']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/admin')}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Verificación de Doctores</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Reporte
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o número de cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
            >
              <option value="all">Todas las especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {applications.filter(app => app.status === 'under_review').length}
              </div>
              <div className="text-sm text-gray-600">En Revisión</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'verified').length}
              </div>
              <div className="text-sm text-gray-600">Verificados</div>
            </Card>
            
            <Card className="p-4 text-center">
              <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rechazados</div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimpleTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Applications List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                
                return (
                  <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              Dr. {application.personalInfo.firstName} {application.personalInfo.lastName}
                            </h3>
                            <Badge className={getStatusColor(application.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {application.status === 'verified' ? 'Verificado' :
                               application.status === 'under_review' ? 'En Revisión' :
                               application.status === 'pending' ? 'Pendiente' :
                               application.status === 'rejected' ? 'Rechazado' : 'Info Adicional'}
                            </Badge>
                            {application.verificationScore && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Score: {application.verificationScore}%
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Stethoscope className="w-4 h-4 mr-2" />
                              <span>{application.professionalInfo.specialty}</span>
                              {application.professionalInfo.subSpecialties.length > 0 && (
                                <span className="ml-2 text-gray-500">
                                  ({application.professionalInfo.subSpecialties.join(', ')})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              <span>Cédula: {application.professionalInfo.licenseNumber}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{application.personalInfo.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              <span>{application.professionalInfo.institution}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{application.location.city}, {application.location.state}</span>
                            </div>
                          </div>

                          {/* Risk Flags */}
                          {application.riskFlags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {application.riskFlags.map((flag, index) => (
                                <Badge key={index} className="bg-red-100 text-red-800">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Documents Status */}
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos:</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.documents.map((doc) => (
                                <Badge
                                  key={doc.id}
                                  className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                >
                                  {getDocumentTypeLabel(doc.type)}
                                  {doc.verified ? ' ✓' : ' ⏳'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Enviado: {application.submissionDate.toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-xs text-gray-500">
                          Experiencia: {application.professionalInfo.yearsOfExperience} años
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Revisar Detalles
                      </Button>
                      
                      {application.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignReviewer(application.id)}
                        >
                          Asignar Revisor
                        </Button>
                      )}
                      
                      {application.status === 'under_review' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerifyDoctor(application.id, true)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleVerifyDoctor(application.id, false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron aplicaciones</p>
              </Card>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Verificación: Dr. {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Professional Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Información Profesional</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Especialidad:</span>
                      <span className="ml-2 font-medium">{selectedApplication.professionalInfo.specialty}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cédula:</span>
                      <span className="ml-2 font-medium">{selectedApplication.professionalInfo.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Experiencia:</span>
                      <span className="ml-2 font-medium">{selectedApplication.professionalInfo.yearsOfExperience} años</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Institución:</span>
                      <span className="ml-2 font-medium">{selectedApplication.professionalInfo.institution}</span>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Educación</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Medicina:</span>
                      <span className="ml-2">{selectedApplication.education.medicalSchool} ({selectedApplication.education.graduationYear})</span>
                    </div>
                    {selectedApplication.education.residency && (
                      <div>
                        <span className="text-gray-600">Residencia:</span>
                        <span className="ml-2">{selectedApplication.education.residency.program} - {selectedApplication.education.residency.institution} ({selectedApplication.education.residency.completionYear})</span>
                      </div>
                    )}
                    {selectedApplication.education.fellowship && (
                      <div>
                        <span className="text-gray-600">Fellowship:</span>
                        <span className="ml-2">{selectedApplication.education.fellowship.program} - {selectedApplication.education.fellowship.institution} ({selectedApplication.education.fellowship.completionYear})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Documentos</h3>
                  <div className="space-y-3">
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{getDocumentTypeLabel(doc.type)}</h4>
                          <p className="text-sm text-gray-600">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Subido: {doc.uploadDate.toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {doc.verified ? 'Verificado' : 'Pendiente'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDocument(doc.url)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de Verificación
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                    placeholder="Agrega notas sobre la verificación..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleVerifyDoctor(selectedApplication.id, false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerifyDoctor(selectedApplication.id, true)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprobar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}