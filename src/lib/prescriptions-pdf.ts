import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { logger } from '@/lib/observability/logger'

// Dynamic import for pdfkit - Node.js only module
// This must be called within async functions to avoid bundling errors
let PDFDocument: any = null
let QRCode: any = null

async function initPdfModules() {
  if (!PDFDocument) {
    const pdfkit = await import('pdfkit')
    PDFDocument = pdfkit.default
  }
  if (!QRCode) {
    const qrcode = await import('qrcode')
    QRCode = qrcode.default || qrcode
  }
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: string
}

export interface PrescriptionData {
  id: string
  doctorName: string
  doctorLicense: string
  doctorSpecialty: string
  patientName: string
  patientAge: number
  date: Date
  diagnosis: string
  medications: Medication[]
  instructions: string
  verificationUrl: string
}

function formatMexicanDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  return age
}

async function generateQRCode(data: string): Promise<string> {
  try {
    await initPdfModules()
    return await QRCode.toDataURL(data, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch (error) {
    logger.error('Error generating prescription PDF', { error: (error as Error).message }, error as Error)
    throw new Error('Failed to generate QR code')
  }
}

export async function generatePrescriptionPDF(data: PrescriptionData): Promise<Buffer> {
  await initPdfModules()
  const verificationQR = await generateQRCode(data.verificationUrl)

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      })

      const chunks: Uint8Array[] = []
      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      const pageWidth = doc.page.width - 120

      doc.fontSize(10).fillColor('#666666')
      doc.text('www.doctory.com.mx', 60, 50, { align: 'center' })

      doc.moveDown(0.5)
      doc.fontSize(20).fillColor('#0066cc').text('DOCTORY', { align: 'center' })
      doc.fontSize(12).fillColor('#666666').text('Telemedicina', { align: 'center' })

      doc.moveDown(1)
      doc.strokeColor('#0066cc').lineWidth(1)
      doc.moveTo(60, doc.y).lineTo(pageWidth + 60, doc.y).stroke()

      doc.moveDown(1.5)
      doc.fontSize(10).fillColor('#333333')

      const leftColumnX = 60
      const rightColumnX = 350

      doc.fontSize(9).fillColor('#666666').text('DR/A:', leftColumnX, doc.y)
      doc.fontSize(10).fillColor('#333333').text(data.doctorName, 90, doc.y - 1)

      doc.fontSize(9).fillColor('#666666').text('ESPECIALIDAD:', leftColumnX, doc.y + 5)
      doc.fontSize(10).fillColor('#333333').text(data.doctorSpecialty, 140, doc.y - 1)

      doc.fontSize(9).fillColor('#666666').text('CÉDULA PROFESIONAL:', leftColumnX, doc.y + 5)
      doc.fontSize(10).fillColor('#333333').text(data.doctorLicense, 190, doc.y - 1)

      doc.fontSize(9).fillColor('#666666').text('FECHA:', rightColumnX, 110)
      doc.fontSize(10).fillColor('#333333').text(formatMexicanDate(data.date), 130, 109)

      doc.fontSize(9).fillColor('#666666').text('PACIENTE:', rightColumnX, 130)
      doc.fontSize(10).fillColor('#333333').text(data.patientName, 150, 129)

      doc.fontSize(9).fillColor('#666666').text('EDAD:', rightColumnX, 150)
      doc.fontSize(10).fillColor('#333333').text(`${data.patientAge} años`, 130, 149)

      doc.moveDown(2)

      doc.strokeColor('#cccccc').lineWidth(0.5)
      doc.moveTo(60, doc.y).lineTo(pageWidth + 60, doc.y).stroke()

      doc.moveDown(1.5)

      doc.fontSize(12).fillColor('#0066cc').text('RÉCEPTA MÉDICA', { align: 'center' })

      doc.moveDown(1)

      doc.fontSize(10).fillColor('#333333')
      if (data.medications.length > 0) {
        doc.fontSize(9).fillColor('#666666').text('MEDICAMENTOS:', 60, doc.y)
        doc.moveDown(0.5)
        doc.fontSize(10).fillColor('#333333')

        data.medications.forEach((med, index) => {
          const medicationText = `${index + 1}. ${med.name} ${med.dosage}`
          const frequencyText = `   Frecuencia: ${med.frequency}`
          const durationText = `   Duración: ${med.duration}`
          const quantityText = `   Cantidad: ${med.quantity}`

          const startY = doc.y
          doc.text(medicationText, 60, startY)

          const secondLineY = startY + 14
          doc.text(frequencyText, 60, secondLineY)

          const thirdLineY = secondLineY + 14
          doc.text(durationText, 60, thirdLineY)

          const fourthLineY = thirdLineY + 14
          doc.text(quantityText, 60, fourthLineY)

          doc.y = fourthLineY + 8
        })
      }

      doc.moveDown(1)

      if (data.diagnosis) {
        doc.fontSize(9).fillColor('#666666').text('DIAGNÓSTICO (ICD-10):', 60, doc.y)
        doc.moveDown(0.3)
        doc.fontSize(10).fillColor('#333333').text(data.diagnosis, 60, doc.y, { width: pageWidth })
        doc.moveDown(0.5)
      }

      if (data.instructions) {
        doc.fontSize(9).fillColor('#666666').text('INDICACIONES:', 60, doc.y)
        doc.moveDown(0.3)
        doc.fontSize(10).fillColor('#333333').text(data.instructions, 60, doc.y, { width: pageWidth })
      }

      doc.moveDown(2)

      doc.strokeColor('#cccccc').lineWidth(0.5)
      doc.moveTo(60, doc.y).lineTo(pageWidth + 60, doc.y).stroke()

      doc.moveDown(2)

      doc.fontSize(9).fillColor('#666666').text('FIRMA DEL MÉDICO:', 60, doc.y)
      doc.moveDown(1.5)

      const signatureY = doc.y
      doc.moveTo(60, signatureY).lineTo(250, signatureY).stroke()

      doc.moveDown(0.5)
      doc.fontSize(8).fillColor('#666666').text(data.doctorName, 60, signatureY + 8)
      doc.text(`Cédula: ${data.doctorLicense}`, 60, signatureY + 18)

      doc.fontSize(9).fillColor('#333333')
      doc.text('Verificación:', 350, signatureY - 5)
      doc.image(verificationQR, 350, signatureY + 10, { width: 70 })
      doc.fontSize(7).fillColor('#666666').text(`${data.verificationUrl}`, 350, signatureY + 85, { width: 70, align: 'center' })

      doc.moveDown(2)

      doc.fontSize(8).fillColor('#999999')
      doc.text('Este documento es una receta médica electrónica generada por Doctor.mx.', 60, doc.y, { align: 'center' })
      doc.text('La autenticidad de este documento puede ser verificada escaneando el código QR.', 60, doc.y, { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

export function buildPrescriptionData(
  prescription: {
    id: string
    appointment_id: string
    diagnosis: string
    medications: string
    instructions: string
  },
  doctor: {
    full_name: string
    license_number: string | null
    specialty: string | null
  },
  patient: {
    full_name: string
    date_of_birth: string | null
  },
  appointmentDate: Date
): PrescriptionData {
  let medications: Medication[] = []
  if (prescription.medications) {
    try {
      const parsed = JSON.parse(prescription.medications)
      if (Array.isArray(parsed)) {
        medications = parsed
      }
    } catch {
      medications = []
    }
  }

  const patientAge = patient.date_of_birth
    ? calculateAge(new Date(patient.date_of_birth))
    : 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.com.mx'
  const verificationUrl = `${appUrl}/verify-prescription/${prescription.id}`

  return {
    id: prescription.id,
    doctorName: doctor.full_name,
    doctorLicense: doctor.license_number || 'N/A',
    doctorSpecialty: doctor.specialty || 'Medicina General',
    patientName: patient.full_name,
    patientAge,
    date: appointmentDate,
    diagnosis: prescription.diagnosis || '',
    medications,
    instructions: prescription.instructions || '',
    verificationUrl,
  }
}

