'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Box, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight,
  Loader2,
  TrendingUp,
  Battery,
  Cpu,
  Zap,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  Activity,
  BarChart3,
  XCircle
} from 'lucide-react'
import { formatDateShort, calculateProgress, formatDate } from '@/lib/utils'

interface DashboardStats {
  totalBatteryBoxes: number
  inProgressBoxes: number
  completedBoxes: number
  totalProcesses: number
  recentBatteryBoxes: Array<{
    id: string
    serialNumber: string
    status: string
    createdAt: string
    processes: Array<{
      id: string
      status: string
      process: { name: string }
    }>
  }>
  processStats: Record<string, number>
}

interface DefectStats {
  summary: {
    totalOpen: number
    totalInReview: number
    totalResolved: number
    criticalCount: number
    highCount: number
  }
  defectsByCategory: Array<{ category: string; count: number }>
  defectsBySeverity: Array<{ severity: string; count: number }>
  recentDefects: Array<{
    id: string
    category: string
    severity: string
    status: string
    description: string
    createdAt: string
    batteryBox: { serialNumber: string }
  }>
  topDefectBoxes: Array<{ serialNumber: string; count: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [defectStats, setDefectStats] = useState<DefectStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [dashboardRes, defectsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/defects/stats')
      ])
      const dashboardData = await dashboardRes.json()
      setStats(dashboardData)
      
      if (defectsRes.ok) {
        const defectsData = await defectsRes.json()
        setDefectStats(defectsData)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    )
  }

  const completionRate = stats.totalBatteryBoxes > 0 
    ? Math.round((stats.completedBoxes / stats.totalBatteryBoxes) * 100) 
    : 0

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-500/20 text-red-400',
    IN_REVIEW: 'bg-yellow-500/20 text-yellow-400',
    RESOLVED: 'bg-green-500/20 text-green-400',
    CLOSED: 'bg-slate-500/20 text-slate-400',
  }

  return (
    <div className="space-y-6">
      {/* TEMSA Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6 md:p-8">
        {/* Circuit Board Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0 50h40M60 50h40M50 0v40M50 60v40" stroke="#00ff88" strokeWidth="1" fill="none"/>
                <circle cx="50" cy="50" r="4" fill="#00ff88"/>
                <circle cx="0" cy="50" r="2" fill="#00ff88"/>
                <circle cx="100" cy="50" r="2" fill="#00ff88"/>
                <circle cx="50" cy="0" r="2" fill="#00ff88"/>
                <circle cx="50" cy="100" r="2" fill="#00ff88"/>
                <path d="M20 20h10v10H20zM70 70h10v10H70zM70 20h10v10H70zM20 70h10v10H20z" stroke="#0088ff" strokeWidth="0.5" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>
        
        {/* Glowing Lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"/>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"/>
        
        {/* TEMSA Branding */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}/>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}/>
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* TEMSA Logo Area */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0066B3] to-[#004080] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
                <span className="text-white font-bold text-xl tracking-tight">TEMSA</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-800 rounded-lg flex items-center justify-center border border-emerald-500/50">
                <Zap className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-mono tracking-wider">ÜRETİM KONTROL MERKEZİ</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Batarya Kutusu Takip Sistemi</h1>
              <p className="text-slate-400 text-sm">E-Bus Üretim Kalite Kontrol</p>
            </div>
          </div>
          
          <Button asChild className="bg-[#0066B3] hover:bg-[#004080] text-white border-0">
            <Link href="/battery-boxes/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Batarya Kutusu
            </Link>
          </Button>
        </div>

        {/* Mini Stats Row */}
        <div className="relative mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalBatteryBoxes}</p>
                <p className="text-xs text-slate-500">Toplam Ünite</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.inProgressBoxes}</p>
                <p className="text-xs text-slate-500">Devam Eden</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.completedBoxes}</p>
                <p className="text-xs text-slate-500">Tamamlanan</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
                <p className="text-xs text-slate-500">Başarı Oranı</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Engineering Dashboard */}
      {defectStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Defect Summary Card */}
          <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Kalite Uygunsuzlukları</CardTitle>
                  <p className="text-xs text-muted-foreground">Aktif hata kayıtları</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">KRİTİK</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">{defectStats.summary.criticalCount}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">YÜKSEK</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{defectStats.summary.highCount}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-medium">AÇIK</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">{defectStats.summary.totalOpen}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">ÇÖZÜLDÜ</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{defectStats.summary.totalResolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Defects by Category */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Kategorilere Göre Hatalar</CardTitle>
                  <p className="text-xs text-muted-foreground">Son 30 gün</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {defectStats.defectsByCategory.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{cat.category}</span>
                        <span className="text-xs font-bold text-slate-900">{cat.count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0066B3] to-cyan-500 rounded-full"
                          style={{ width: `${Math.min((cat.count / (defectStats.defectsByCategory[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {defectStats.defectsByCategory.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Henüz veri yok</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Defects */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Son Uygunsuzluklar</CardTitle>
                  <p className="text-xs text-muted-foreground">En son kaydedilen hatalar</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {defectStats.recentDefects.slice(0, 4).map((defect) => (
                  <div key={defect.id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Badge className={`${severityColors[defect.severity]} text-[10px] shrink-0`}>
                      {defect.severity}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 truncate">{defect.category}</p>
                      <p className="text-[10px] text-slate-500 truncate">{defect.batteryBox.serialNumber}</p>
                    </div>
                    <Badge className={`${statusColors[defect.status]} text-[10px]`}>
                      {defect.status === 'OPEN' ? 'AÇIK' : defect.status === 'IN_REVIEW' ? 'İNCELEMEDE' : 'ÇÖZÜLDÜ'}
                    </Badge>
                  </div>
                ))}
                {defectStats.recentDefects.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Henüz hata kaydı yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Battery Boxes */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Battery className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">Son Batarya Kutuları</CardTitle>
              <p className="text-xs text-muted-foreground">En son üretim üniteleri</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/battery-boxes">
              Tümünü Gör
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentBatteryBoxes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Box className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium">Henüz batarya kutusu yok</p>
              <p className="text-sm mt-1">İlk ünitenizi oluşturarak başlayın</p>
              <Button asChild className="mt-4 bg-[#0066B3] hover:bg-[#004080]">
                <Link href="/battery-boxes/new">Batarya Kutusu Oluştur</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {stats.recentBatteryBoxes.map((box) => {
                const completedProcesses = box.processes.filter(p => p.status === 'COMPLETED').length
                const totalProcesses = box.processes.length
                const progress = calculateProgress(completedProcesses, totalProcesses)

                return (
                  <Link
                    key={box.id}
                    href={`/battery-boxes/${box.id}`}
                    className="flex items-center justify-between py-4 hover:bg-slate-50 -mx-6 px-6 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        box.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Battery className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-[#0066B3] transition-colors">{box.serialNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDateShort(box.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{completedProcesses}/{totalProcesses}</p>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              progress === 100 ? 'bg-emerald-500' : 'bg-[#0066B3]'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          box.status === 'COMPLETED' 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }
                      >
                        {box.status === 'COMPLETED' ? 'Tamamlandı' : 'Aktif'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0066B3] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TEMSA Footer Branding */}
      <div className="text-center py-4 border-t">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-[#0066B3]">TEMSA</span> Batarya Kutusu Takip Sistemi • TrackBat v1.0
        </p>
      </div>
    </div>
  )
}
