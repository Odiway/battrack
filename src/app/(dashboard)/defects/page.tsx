'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  Battery,
  Cpu,
  Eye,
  Edit2,
  ArrowRight
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'
import { useAuth } from '@/components/auth-provider'

interface Defect {
  id: string
  category: string
  subcategory: string | null
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'
  notes: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  batteryBox: { serialNumber: string }
  checklistAnswer: {
    answeredBy: { name: string }
    batteryBoxProcess: {
      process: { name: string }
    }
  }
  resolvedBy: { name: string } | null
}

export default function DefectsPage() {
  const { user } = useAuth()
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editSeverity, setEditSeverity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDefects()
  }, [])

  async function fetchDefects() {
    try {
      const res = await fetch('/api/defects')
      if (res.ok) {
        const data = await res.json()
        setDefects(data)
      }
    } catch (error) {
      console.error('Failed to fetch defects:', error)
    } finally {
      setLoading(false)
    }
  }

  function openEditDialog(defect: Defect) {
    setSelectedDefect(defect)
    setEditStatus(defect.status)
    setEditSeverity(defect.severity)
    setEditNotes(defect.notes || '')
    setEditDialogOpen(true)
  }

  async function handleSaveDefect() {
    if (!selectedDefect) return
    setSaving(true)

    try {
      const res = await fetch(`/api/defects/${selectedDefect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          severity: editSeverity,
          notes: editNotes,
        }),
      })

      if (res.ok) {
        setEditDialogOpen(false)
        fetchDefects()
      }
    } catch (error) {
      console.error('Failed to update defect:', error)
    } finally {
      setSaving(false)
    }
  }

  // Get unique categories for filter
  const categories = [...new Set(defects.map(d => d.category))]

  // Filter defects
  const filteredDefects = defects.filter(defect => {
    const matchesSearch = 
      defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.batteryBox.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter
    const matchesCategory = categoryFilter === 'all' || defect.category === categoryFilter

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory
  })

  // Stats
  const openCount = defects.filter(d => d.status === 'OPEN').length
  const criticalCount = defects.filter(d => d.severity === 'CRITICAL' && d.status !== 'CLOSED').length
  const highCount = defects.filter(d => d.severity === 'HIGH' && d.status !== 'CLOSED').length
  const resolvedCount = defects.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  const severityLabels: Record<string, string> = {
    CRITICAL: 'KRİTİK',
    HIGH: 'YÜKSEK',
    MEDIUM: 'ORTA',
    LOW: 'DÜŞÜK',
  }

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-700 border-red-200',
    IN_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-700 border-green-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  const statusLabels: Record<string, string> = {
    OPEN: 'AÇIK',
    IN_REVIEW: 'İNCELEMEDE',
    RESOLVED: 'ÇÖZÜLDÜ',
    CLOSED: 'KAPANDI',
  }

  const statusIcons: Record<string, React.ReactNode> = {
    OPEN: <XCircle className="w-3 h-3" />,
    IN_REVIEW: <Clock className="w-3 h-3" />,
    RESOLVED: <CheckCircle2 className="w-3 h-3" />,
    CLOSED: <CheckCircle2 className="w-3 h-3" />,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066B3]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-red-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="cyan" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-red-400" />
                <span className="text-red-400 text-xs font-mono">KALİTE KONTROL</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Uygunsuzluk Kayıtları</h1>
              <p className="text-slate-400 text-sm">TEMSA Batarya Kutusu Kalite Takibi</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-xs text-red-300">Kritik</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-orange-400">{highCount}</p>
              <p className="text-xs text-orange-300">Yüksek</p>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-yellow-400">{openCount}</p>
              <p className="text-xs text-yellow-300">Açık</p>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
              <p className="text-xs text-emerald-300">Çözüldü</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Ara (seri no, açıklama, kategori...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="OPEN">Açık</SelectItem>
                  <SelectItem value="IN_REVIEW">İncelemede</SelectItem>
                  <SelectItem value="RESOLVED">Çözüldü</SelectItem>
                  <SelectItem value="CLOSED">Kapandı</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Önem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Önemler</SelectItem>
                  <SelectItem value="CRITICAL">Kritik</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="LOW">Düşük</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defects List */}
      <Card className="border-slate-200">
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Uygunsuzluk Listesi
              <Badge variant="outline" className="ml-2">{filteredDefects.length} kayıt</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDefects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="font-medium">Uygunsuzluk kaydı bulunamadı</p>
              <p className="text-sm mt-1">Filtreleri değiştirmeyi deneyin</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDefects.map((defect) => (
                <div key={defect.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Severity Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      defect.severity === 'CRITICAL' ? 'bg-red-100' :
                      defect.severity === 'HIGH' ? 'bg-orange-100' :
                      defect.severity === 'MEDIUM' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {defect.severity === 'CRITICAL' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                       defect.severity === 'HIGH' ? <AlertTriangle className="w-5 h-5 text-orange-600" /> :
                       <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className={`${severityColors[defect.severity]} border text-xs`}>
                              {severityLabels[defect.severity]}
                            </Badge>
                            <Badge className={`${statusColors[defect.status]} border text-xs flex items-center gap-1`}>
                              {statusIcons[defect.status]}
                              {statusLabels[defect.status]}
                            </Badge>
                            <span className="text-xs text-slate-500 font-medium">{defect.category}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">{defect.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Battery className="w-3 h-3" />
                              {defect.batteryBox.serialNumber}
                            </span>
                            <span>{defect.checklistAnswer.batteryBoxProcess.process.name}</span>
                            <span>•</span>
                            <span>{defect.checklistAnswer.answeredBy.name}</span>
                            <span>•</span>
                            <span>{formatDate(defect.createdAt)}</span>
                          </div>
                          {defect.notes && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2 rounded">
                              <strong>Not:</strong> {defect.notes}
                            </p>
                          )}
                          {defect.resolvedBy && (
                            <p className="text-xs text-emerald-600 mt-1">
                              ✓ Çözen: {defect.resolvedBy.name} - {formatDate(defect.resolvedAt)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/battery-boxes/${defect.batteryBox.serialNumber}`}>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#0066B3]">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {(user?.role === 'QUALITY' || user?.role === 'ADMIN') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-500 hover:text-[#0066B3]"
                              onClick={() => openEditDialog(defect)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uygunsuzluk Düzenle</DialogTitle>
          </DialogHeader>
          {selectedDefect && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">{selectedDefect.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedDefect.batteryBox.serialNumber} • {selectedDefect.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Açık</SelectItem>
                      <SelectItem value="IN_REVIEW">İncelemede</SelectItem>
                      <SelectItem value="RESOLVED">Çözüldü</SelectItem>
                      <SelectItem value="CLOSED">Kapandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Önem Derecesi</Label>
                  <Select value={editSeverity} onValueChange={setEditSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">Kritik</SelectItem>
                      <SelectItem value="HIGH">Yüksek</SelectItem>
                      <SelectItem value="MEDIUM">Orta</SelectItem>
                      <SelectItem value="LOW">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notlar</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Çözüm veya ek bilgi ekleyin..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditDialogOpen(false)}
                >
                  İptal
                </Button>
                <Button 
                  className="flex-1 bg-[#0066B3] hover:bg-[#004080]"
                  onClick={handleSaveDefect}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* TEMSA Footer */}
      <div className="text-center py-4 border-t">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-[#0066B3]">TEMSA</span> Kalite Yönetim Sistemi
        </p>
      </div>
    </div>
  )
}
