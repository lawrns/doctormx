// Doctor Referral Component - Share and earn rewards
// Displays referral code, stats, and sharing options

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Gift,
  Share2,
  Users,
  CheckCircle,
  Clock,
  Copy,
  MessageCircle,
  Link as LinkIcon,
  Trophy,
  ArrowRight
} from 'lucide-react'

interface ReferralStats {
  code: string
  url: string
  totalReferrals: number
  converted: number
  pending: number
  nextReward: {
    type: string
    value: number
    description: string
  } | null
  totalRewards: Array<{
    reward_type: string
    reward_value: number
    description: string
    created_at: string
  }>
}

export default function DoctorReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralStats()
  }, [])

  async function fetchReferralStats() {
    try {
      const response = await fetch('/api/doctor/referrals')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareViaWhatsApp() {
    if (!stats?.url) return
    const message = encodeURIComponent(
      `¡Únete a Doctor.mx! La plataforma que está revolucionando la telemedicina en México. ` +
      `Usa mi código de referido y empieza a crecer tu práctica: ${stats.url}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  if (loading) {
    return (<div className="flex items-center justify-center h-64">Cargando...</div>)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Programa de Referidos</h1>
          <p className="text-gray-600">Invita colegas y gana meses gratis</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-4">Tu Código de Referido</h2>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Input
              value={stats?.code || ''}
              readOnly
              className="text-center text-xl font-mono bg-white"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => copyToClipboard(stats?.code || '')}
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-white rounded-lg mb-4">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <Input
            value={stats?.url || ''}
            readOnly
            className="text-sm border-0 bg-transparent"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(stats?.url || '')}
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={shareViaWhatsApp}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Compartir por WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Únete a Doctor.mx',
                  text: 'La plataforma de telemedicina que está revolucionando México',
                  url: stats?.url,
                })
              } else {
                copyToClipboard(stats?.url || '')
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
          <p className="text-gray-500">Total Referidos</p>
        </Card>

        <Card className="p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.converted || 0}</p>
          <p className="text-gray-500">Convertidos</p>
        </Card>

        <Card className="p-4 text-center">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.pending || 0}</p>
          <p className="text-gray-500">Pendientes</p>
        </Card>
      </div>

      {/* Next Reward */}
      {stats?.nextReward && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold">Próxima Recompensa</h3>
          </div>
          
          <p className="text-lg mb-2">
            {stats.nextReward.description}
          </p>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {stats.totalReferrals + 1}° referido
            </Badge>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <Badge className="bg-purple-100 text-purple-700">
              {stats.nextReward.description}
            </Badge>
          </div>
        </Card>
      )}

      {/* Reward Milestones */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Tabla de Recompensas</h3>
        
        <div className="space-y-3">
          {[
            { count: 1, reward: '1 mes gratis', active: (stats?.converted || 0) >= 1 },
            { count: 3, reward: '2 meses gratis', active: (stats?.converted || 0) >= 3 },
            { count: 5, reward: 'Upgrade a Pro 1 mes', active: (stats?.converted || 0) >= 5 },
            { count: 10, reward: '6 meses gratis', active: (stats?.converted || 0) >= 10 },
          ].map((milestone) => (
            <div
              key={milestone.count}
              className={`flex items-center justify-between p-3 rounded-lg ${
                milestone.active 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.active 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {milestone.active ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{milestone.count}</span>
                  )}
                </div>
                <span className={milestone.active ? 'font-medium' : 'text-gray-500'}>
                  {milestone.reward}
                </span>
              </div>
              
              {milestone.active && <Badge className="bg-green-100 text-green-700">Ganado</Badge>}
            </div>
          ))}
        </div>
      </Card>

      {/* Earned Rewards */}
      {stats?.totalRewards && stats.totalRewards.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Tus Recompensas</h3>
          
          <div className="space-y-2">
            {stats.totalRewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-green-600" />
                  <span>{reward.description}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(reward.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
