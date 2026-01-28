'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Loader2, 
  Cog,
  Edit,
  Trash2,
  ClipboardList,
  Cpu
} from 'lucide-react'
import { toast } from 'sonner'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface Process {
  id: string
  name: string
  description: string | null
  checklistRequired: boolean
  displayOrder: number
  active: boolean
  createdAt: string
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [checklistRequired, setChecklistRequired] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)

  useEffect(() => {
    fetchProcesses()
  }, [])

  async function fetchProcesses() {
    try {
      const res = await fetch('/api/processes')
      const data = await res.json()
      setProcesses(data)
    } catch (error) {
      console.error('Failed to fetch processes:', error)
      toast.error('Failed to load processes')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setDescription('')
    setChecklistRequired(false)
    setDisplayOrder(processes.length)
    setEditingProcess(null)
  }

  function handleEdit(process: Process) {
    setEditingProcess(process)
    setName(process.name)
    setDescription(process.description || '')
    setChecklistRequired(process.checklistRequired)
    setDisplayOrder(process.displayOrder)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingProcess) {
        const res = await fetch(`/api/processes/${editingProcess.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, checklistRequired, displayOrder }),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast.success('Process updated')
      } else {
        const res = await fetch('/api/processes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, checklistRequired, displayOrder }),
        })
        if (!res.ok) throw new Error('Failed to create')
        toast.success('Process created')
      }

      setDialogOpen(false)
      resetForm()
      fetchProcesses()
    } catch (error) {
      toast.error('Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this process?')) return

    try {
      const res = await fetch(`/api/processes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Process deleted')
      fetchProcesses()
    } catch (error) {
      toast.error('Failed to delete process')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-emerald-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="emerald" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Cog className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-mono">ADMIN</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Processes</h1>
              <p className="text-slate-400 text-sm">Manage manufacturing processes</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Process
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProcess ? 'Edit Process' : 'Add Process'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Mechanical Assembly"
                    required
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-300"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checklistRequired"
                    checked={checklistRequired}
                    onCheckedChange={(checked) => setChecklistRequired(checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="checklistRequired" className="cursor-pointer">
                    Checklist required for this process
                </Label>
              </div>
                <p className="text-sm text-slate-500">
                  If checked, operators must complete a checklist before this process can be marked as done.
                </p>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProcess ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {processes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Cog className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No processes yet</h3>
            <p className="text-slate-500 mt-1">
              Create your first manufacturing process
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {processes.map((process) => (
            <Card key={process.id} className="border-slate-200 hover:border-emerald-200 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-lg">
                      <Cog className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{process.name}</CardTitle>
                      {process.description && (
                        <CardDescription className="text-slate-500">{process.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {process.checklistRequired ? (
                      <Badge variant="outline" className="border-cyan-300 text-cyan-600">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        Checklist Required
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                        Auto-Complete
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(process)} className="hover:bg-slate-100">
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(process.id)} className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
