'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, ClipboardList, CheckCircle2, Battery, Cpu, Zap } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface Process {
  id: string
  name: string
  description: string | null
  checklistRequired: boolean
  displayOrder: number
}

interface ChecklistTemplate {
  id: string
  name: string
  description: string | null
  questions: Array<{ id: string; questionText: string }>
}

interface SelectedProcess {
  processId: string
  checklistTemplateId?: string
}

export default function NewBatteryBoxPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [processes, setProcesses] = useState<Process[]>([])
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  
  const [serialNumber, setSerialNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedProcesses, setSelectedProcesses] = useState<SelectedProcess[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [processRes, templateRes] = await Promise.all([
        fetch('/api/processes'),
        fetch('/api/checklist-templates'),
      ])
      const processData = await processRes.json()
      const templateData = await templateRes.json()
      setProcesses(processData)
      setTemplates(templateData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function handleProcessToggle(processId: string, checked: boolean) {
    if (checked) {
      setSelectedProcesses([...selectedProcesses, { processId }])
    } else {
      setSelectedProcesses(selectedProcesses.filter(p => p.processId !== processId))
    }
  }

  function handleTemplateSelect(processId: string, templateId: string) {
    setSelectedProcesses(selectedProcesses.map(p => 
      p.processId === processId 
        ? { ...p, checklistTemplateId: templateId === 'none' ? undefined : templateId }
        : p
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!serialNumber.trim()) {
      toast.error('Serial number is required')
      return
    }

    if (selectedProcesses.length === 0) {
      toast.error('Select at least one process')
      return
    }

    // Validate that processes requiring checklists have templates selected
    for (const sp of selectedProcesses) {
      const process = processes.find(p => p.id === sp.processId)
      if (process?.checklistRequired && !sp.checklistTemplateId) {
        toast.error(`${process.name} requires a checklist template`)
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/battery-boxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serialNumber.trim(),
          notes: notes.trim() || undefined,
          selectedProcesses,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create battery box')
      }

      toast.success('Battery box created successfully')
      router.push(`/battery-boxes/${data.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create battery box')
    } finally {
      setSubmitting(false)
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-emerald-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="cyan" />
        
        <div className="relative flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white hover:bg-slate-800">
            <Link href="/battery-boxes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Battery className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-mono">CREATE NEW</span>
            </div>
            <h1 className="text-2xl font-bold text-white">New Battery Box</h1>
            <p className="text-slate-400 text-sm">Create a new battery box and assign processes</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                placeholder="e.g., BB-2024-001"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="h-12 border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this battery box..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-slate-300 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Process Selection */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-500" />
              Select Processes
            </CardTitle>
            <CardDescription>
              Choose which processes this battery box will go through
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processes.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p>No processes available.</p>
                <p className="text-sm">An admin needs to create processes first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processes.map((process) => {
                  const isSelected = selectedProcesses.some(p => p.processId === process.id)
                  const selectedProcess = selectedProcesses.find(p => p.processId === process.id)

                  return (
                    <div 
                      key={process.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={process.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleProcessToggle(process.id, checked as boolean)
                          }
                          className="mt-1 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <label 
                              htmlFor={process.id}
                              className="font-medium cursor-pointer"
                            >
                              {process.name}
                            </label>
                            {process.checklistRequired ? (
                              <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-600">
                                <ClipboardList className="h-3 w-3 mr-1" />
                                Checklist Required
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Auto-Complete
                              </Badge>
                            )}
                          </div>
                          {process.description && (
                            <p className="text-sm text-slate-500 mt-1">
                              {process.description}
                            </p>
                          )}
                          
                          {/* Template Selection */}
                          {isSelected && process.checklistRequired && (
                            <div className="mt-3">
                              <Label className="text-sm">Select Checklist Template *</Label>
                              <Select
                                value={selectedProcess?.checklistTemplateId || 'none'}
                                onValueChange={(value) => handleTemplateSelect(process.id, value)}
                              >
                                <SelectTrigger className="mt-1 border-slate-300">
                                  <SelectValue placeholder="Choose a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Select a template...</SelectItem>
                                  {templates.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                      {template.name} ({template.questions.length} questions)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedProcesses.length > 0 && (
          <Card className="border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-2">
                Selected {selectedProcesses.length} process{selectedProcesses.length !== 1 ? 'es' : ''}:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProcesses.map(sp => {
                  const process = processes.find(p => p.id === sp.processId)
                  const template = templates.find(t => t.id === sp.checklistTemplateId)
                  return (
                    <Badge key={sp.processId} className="bg-slate-900 text-white">
                      {process?.name}
                      {template && ` → ${template.name}`}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
            className="flex-1 border-slate-300"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || selectedProcesses.length === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Battery Box'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
