import { requireRole } from '@/lib/auth'
import UploadImageClient from './UploadImageClient'

export default async function UploadImagePage() {
  const { user, profile } = await requireRole('patient')

  return <UploadImageClient />
}
