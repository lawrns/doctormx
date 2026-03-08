'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Lock,
  Eye,
  CheckCircle,
  Server,
  Database,
  Key,
  FileText,
  AlertTriangle,
  Award,
  Verified,
  Users,
  Activity
} from 'lucide-react'

const securityFeatures = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All consultations and patient data are encrypted using AES-256 encryption, the same standard used by banks and governments.',
    details: [
      'Video calls use WebRTC with DTLS-SRTP',
      'Chat messages encrypted at rest and in transit',
      'File uploads encrypted before storage'
    ]
  },
  {
    icon: Shield,
    title: 'HIPAA Compliance',
    description: 'Our platform is designed to meet HIPAA requirements for protecting sensitive patient health information.',
    details: [
      'Business Associate Agreements with all partners',
      'Regular security assessments and audits',
      'Staff training on privacy and security protocols'
    ]
  },
  {
    icon: Database,
    title: 'Secure Data Storage',
    description: 'Patient data is stored in secure, redundant data centers with strict access controls.',
    details: [
      'Encrypted databases with field-level security',
      'Automated daily backups with point-in-time recovery',
      'Geographic redundancy for disaster recovery'
    ]
  },
  {
    icon: Key,
    title: 'Access Control',
    description: 'Multi-factor authentication and role-based access ensure only authorized users can access sensitive information.',
    details: [
      '2FA required for all healthcare providers',
      'Role-based permissions (patient, doctor, admin)',
      'Session timeout and automatic logout'
    ]
  }
]

const certifications = [
  {
    name: 'ISO 27001',
    description: 'Information Security Management',
    icon: Verified,
    status: 'In Progress'
  },
  {
    name: 'SOC 2 Type II',
    description: 'Security, Availability, Processing Integrity',
    icon: Award,
    status: 'Planned Q2 2024'
  },
  {
    name: 'COFEPRIS',
    description: 'Mexican Health Authority Compliance',
    icon: CheckCircle,
    status: 'Certified'
  },
  {
    name: 'HITECH',
    description: 'Health Information Technology',
    icon: FileText,
    status: 'Compliant'
  }
]

const complianceAreas = [
  {
    area: 'Data Privacy',
    standards: ['HIPAA', 'LFPDPPP', 'GDPR Ready'],
    icon: Eye
  },
  {
    area: 'Security Operations',
    standards: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
    icon: Server
  },
  {
    area: 'Medical Device',
    standards: ['IEC 62304', 'FDA Guidelines', 'COFEPRIS'],
    icon: Activity
  },
  {
    area: 'Cloud Security',
    standards: ['AWS Well-Architected', 'Cloud Controls Matrix', 'CSA STAR'],
    icon: Database
  }
]

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Security & Privacy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Protecting your health information is our highest priority. We use industry-leading 
              security measures to ensure your data remains confidential and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                HIPAA Compliant
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Lock className="w-4 h-4 mr-2" />
                AES-256 Encrypted
              </Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">
                <Shield className="w-4 h-4 mr-2" />
                COFEPRIS Certified
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Protect Your Data</h2>
            <p className="text-lg text-gray-600">
              Multi-layered security measures to safeguard your health information
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compliance & Certifications</h2>
            <p className="text-lg text-gray-600">
              We adhere to strict healthcare industry standards and regulations
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{cert.description}</p>
                  <Badge 
                    variant={cert.status === 'Certified' ? 'default' : cert.status === 'In Progress' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {cert.status}
                  </Badge>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <area.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{area.area}</h3>
                  </div>
                  <div className="space-y-1">
                    {area.standards.map((standard, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mr-1 mb-1">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Rights & Control</h2>
            <p className="text-lg text-gray-600">
              You have full control over your health information
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Patient Rights</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Access your complete medical history
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Request corrections to your information
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Obtain a copy of your data
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Delete your account and data
                </li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Security Best Practices</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Use strong, unique passwords
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Enable two-factor authentication
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Review access logs regularly
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Report suspicious activity
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Team</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our dedicated security team monitors and protects our platform 24/7
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <Shield className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Continuous security monitoring and threat detection
                </p>
              </Card>
              <Card className="p-6">
                <Activity className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">Regular Audits</h3>
                <p className="text-sm text-gray-600">
                  Quarterly security assessments and penetration testing
                </p>
              </Card>
              <Card className="p-6">
                <FileText className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-1">Incident Response</h3>
                <p className="text-sm text-gray-600">
                  Rapid response team for any security incidents
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Security */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Concerns?</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you have any security questions or concerns, our team is here to help
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Contact Security Team
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
