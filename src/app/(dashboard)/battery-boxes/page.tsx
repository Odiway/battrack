'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Battery, 
  Plus, 
  Search, 
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
  Cpu,
  ArrowRight
} from 'lucide-react'
import { formatDate, calculateProgress } from '@/lib/utils'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface BatteryBox {
  id: string
  serialNumber: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  notes: string | null
  createdAt: string
  completedAt: string | null
  processes: Array<{
    id: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    process: { name: string }
    checklistTemplate: { name: string } | null
  }>
}

export default function BatteryBoxesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [batteryBoxes, setBatteryBoxes] = useState<BatteryBox[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')

  useEffect(() => {
    fetchBatteryBoxes()
  }, [searchParams])

  async function fetchBatteryBoxes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter)
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/battery-boxes?${params}`)
      const data = await res.json()
      setBatteryBoxes(data)
    } catch (error) {
      console.error('Failed to fetch battery boxes:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search) params.set('search', search)
    router.push(`/battery-boxes?${params}`)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    const params = new URLSearchParams()
    if (value !== 'ALL') params.set('status', value)
    if (search) params.set('search', search)
    router.push(`/battery-boxes?${params}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-emerald-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="cyan" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-mono">INVENTORY</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Battery Boxes</h1>
            </div>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/battery-boxes/new">
              <Plus className="h-4 w-4 mr-2" />
              New Battery Box
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-48 border-slate-300">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : batteryBoxes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Battery className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No battery boxes found</h3>
            <p className="text-muted-foreground mt-1">
              {search || statusFilter !== 'ALL' 
                ? 'Try adjusting your filters'
                : 'Get started by creating your first battery box'
              }
            </p>
            {!search && statusFilter === 'ALL' && (
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/battery-boxes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Battery Box
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {batteryBoxes.map((box) => {
            const completedProcesses = box.processes.filter(p => p.status === 'COMPLETED').length
            const totalProcesses = box.processes.length
            const progress = calculateProgress(completedProcesses, totalProcesses)

            return (
              <Link key={box.id} href={`/battery-boxes/${box.id}`} className="group">
                <Card className="border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          box.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-amber-100 text-amber-600'
                        }`}>
                          <Battery className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                            {box.serialNumber}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(box.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline"
                          className={box.status === 'COMPLETED' 
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                            : 'border-amber-300 bg-amber-50 text-amber-700'}
                        >
                          {box.status === 'COMPLETED' ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Complete</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Active</>
                          )}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {box.processes.slice(0, 4).map((bp) => (
                          <Badge 
                            key={bp.id} 
                            variant="outline"
                            className={
                              bp.status === 'COMPLETED' 
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600' 
                                : bp.status === 'IN_PROGRESS'
                                ? 'border-cyan-200 bg-cyan-50 text-cyan-600'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }
                          >
                            {bp.process.name}
                          </Badge>
                        ))}
                        {box.processes.length > 4 && (
                          <Badge variant="outline" className="border-slate-200">
                            +{box.processes.length - 4} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                          {completedProcesses}/{totalProcesses}
                        </span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              progress === 100 ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
