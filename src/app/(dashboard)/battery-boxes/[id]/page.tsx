'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  Circle,
  PlayCircle,
  Download,
  Trash2,
  Battery,
  Cpu,
  Zap
} from 'lucide-react'
import { formatDate, calculateProgress } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface Question {
  id: string
  questionText: string
  questionType: string
  required: boolean
  displayOrder: number
}

interface Answer {
  id: string
  questionId: string
  answer: string
  answeredAt: string
  answeredBy: {
    id: string
    name: string
    email: string
  }
}

interface BatteryBoxProcess {
  id: string
  processId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  startedAt: string | null
  completedAt: string | null
  displayOrder: number
  process: {
    id: string
    name: string
    description: string | null
  }
  checklistTemplate: {
    id: string
    name: string
    questions: Question[]
  } | null
  answers: Answer[]
}

interface BatteryBox {
  id: string
  serialNumber: string
  status: 'IN_PROGRESS' | 'COMPLETED'
  notes: string | null
  createdAt: string
  completedAt: string | null
  processes: BatteryBoxProcess[]
}

export default function BatteryBoxDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [batteryBox, setBatteryBox] = useState<BatteryBox | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeProcess, setActiveProcess] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBatteryBox()
  }, [resolvedParams.id])

  async function fetchBatteryBox() {
    try {
      const res = await fetch(`/api/battery-boxes/${resolvedParams.id}`)
      if (!res.ok) throw new Error('Battery box not found')
      const data = await res.json()
      setBatteryBox(data)
      
      // Set active process to first in-progress or pending with checklist
      const inProgress = data.processes.find((p: BatteryBoxProcess) => p.status === 'IN_PROGRESS')
      const pending = data.processes.find((p: BatteryBoxProcess) => 
        p.status === 'PENDING' && p.checklistTemplate
      )
      if (inProgress) {
        setActiveProcess(inProgress.processId)
        initializeAnswers(inProgress)
      } else if (pending) {
        setActiveProcess(pending.processId)
      }
    } catch (error) {
      console.error('Failed to fetch battery box:', error)
      toast.error('Battery box not found')
      router.push('/battery-boxes')
    } finally {
      setLoading(false)
    }
  }

  function initializeAnswers(process: BatteryBoxProcess) {
    const initial: Record<string, string> = {}
    process.answers.forEach(a => {
      initial[a.questionId] = a.answer
    })
    setAnswers(initial)
  }

  async function handleStartProcess(processId: string) {
    try {
      const res = await fetch(`/api/battery-boxes/${resolvedParams.id}/processes/${processId}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to start process')
      await fetchBatteryBox()
      setActiveProcess(processId)
      toast.success('Process started')
    } catch (error) {
      toast.error('Failed to start process')
    }
  }

  async function handleSaveAnswers() {
    if (!activeProcess) return
    
    const process = batteryBox?.processes.find(p => p.processId === activeProcess)
    if (!process?.checklistTemplate) return

    setSaving(true)
    try {
      const answerList = Object.entries(answers)
        .filter(([, value]) => value)
        .map(([questionId, answer]) => ({ questionId, answer }))

      const res = await fetch(`/api/battery-boxes/${resolvedParams.id}/processes/${activeProcess}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerList }),
      })

      if (!res.ok) throw new Error('Failed to save answers')
      
      await fetchBatteryBox()
      toast.success('Answers saved')
    } catch (error) {
      toast.error('Failed to save answers')
    } finally {
      setSaving(false)
    }
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/battery-boxes/${resolvedParams.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Battery box deleted')
      router.push('/battery-boxes')
    } catch (error) {
      toast.error('Failed to delete battery box')
    }
  }

  function handleExport(processId: string) {
    window.open(`/api/battery-boxes/${resolvedParams.id}/processes/${processId}/export`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!batteryBox) return null

  const currentProcess = batteryBox.processes.find(p => p.processId === activeProcess)
  const completedProcesses = batteryBox.processes.filter(p => p.status === 'COMPLETED').length
  const totalProcesses = batteryBox.processes.length
  const progress = calculateProgress(completedProcesses, totalProcesses)

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
                <span className="text-emerald-400 text-xs font-mono">BATTERY BOX</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{batteryBox.serialNumber}</h1>
                <Badge 
                  className={batteryBox.status === 'COMPLETED' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}
                >
                  {batteryBox.status === 'COMPLETED' ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Complete</>
                  ) : (
                    <><Zap className="w-3 h-3 mr-1" /> Active</>
                  )}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm">Created {formatDate(batteryBox.createdAt)}</p>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Battery Box?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {batteryBox.serialNumber} and all its data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-slate-500">
              {completedProcesses}/{totalProcesses} processes
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Process List */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-500" />
                Processes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {batteryBox.processes.map((bp) => {
                const isActive = bp.processId === activeProcess
                const hasChecklist = !!bp.checklistTemplate
                const answeredCount = bp.answers.length
                const totalQuestions = bp.checklistTemplate?.questions.length || 0

                return (
                  <div
                    key={bp.id}
                    onClick={() => {
                      if (hasChecklist) {
                        setActiveProcess(bp.processId)
                        initializeAnswers(bp)
                      }
                    }}
                    role="button"
                    tabIndex={hasChecklist ? 0 : -1}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                    } ${!hasChecklist ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        bp.status === 'COMPLETED' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : bp.status === 'IN_PROGRESS'
                          ? 'bg-cyan-100 text-cyan-600'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {bp.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : bp.status === 'IN_PROGRESS' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{bp.process.name}</div>
                        <div className="text-xs text-slate-500">
                          {hasChecklist ? (
                            `${answeredCount}/${totalQuestions} answered`
                          ) : (
                            'No checklist'
                          )}
                        </div>
                      </div>
                      {hasChecklist && (bp.status === 'COMPLETED' || bp.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-500 hover:text-emerald-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExport(bp.processId)
                          }}
                          title="İndir"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Checklist Form */}
        <div className="lg:col-span-2">
          {currentProcess?.checklistTemplate ? (
            <Card className="border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-500" />
                      {currentProcess.process.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {currentProcess.checklistTemplate.name}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      currentProcess.status === 'COMPLETED' 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                        : currentProcess.status === 'IN_PROGRESS'
                        ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                        : 'border-slate-300 bg-slate-50 text-slate-600'
                    }
                  >
                    {currentProcess.status === 'COMPLETED' 
                      ? 'Completed' 
                      : currentProcess.status === 'IN_PROGRESS'
                      ? 'In Progress'
                      : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {currentProcess.status === 'PENDING' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-cyan-600" />
                    </div>
                    <p className="text-slate-500 mb-4">
                      Start this process to begin the checklist
                    </p>
                    <Button onClick={() => handleStartProcess(currentProcess.processId)} className="bg-emerald-600 hover:bg-emerald-700">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Process
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentProcess.checklistTemplate.questions.map((question, index) => {
                      const answer = currentProcess.answers.find(a => a.questionId === question.id)
                      const currentAnswer = answers[question.id] || ''
                      
                      return (
                        <div key={question.id} className="space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium">{question.questionText}</p>
                              {question.required && (
                                <span className="text-xs text-red-500">Required</span>
                              )}
                            </div>
                          </div>
                          
                          {currentProcess.status === 'COMPLETED' ? (
                            <div className="ml-9 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className={`font-medium ${answer?.answer === 'AÇIK' ? 'text-amber-600' : ''}`}>
                                {answer?.answer || '-'}
                                {answer?.answer === 'AÇIK' && (
                                  <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-300">Açık Bırakıldı</Badge>
                                )}
                              </p>
                              {answer && (
                                <p className="text-xs text-slate-500 mt-1">
                                  by {answer.answeredBy.name} • {formatDate(answer.answeredAt)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="ml-9">
                              {question.questionType === 'YES_NO' ? (
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={currentAnswer === 'Yes' ? 'default' : 'outline'}
                                    className={`flex-1 h-12 ${currentAnswer === 'Yes' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => handleAnswerChange(question.id, 'Yes')}
                                  >
                                    Evet
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={currentAnswer === 'No' ? 'default' : 'outline'}
                                    className={`flex-1 h-12 ${currentAnswer === 'No' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-300 hover:bg-slate-50'}`}
                                    onClick={() => handleAnswerChange(question.id, 'No')}
                                  >
                                    Hayır
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={currentAnswer === 'AÇIK' ? 'default' : 'outline'}
                                    className={`h-12 px-4 ${currentAnswer === 'AÇIK' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 text-amber-600 hover:bg-amber-50'}`}
                                    onClick={() => handleAnswerChange(question.id, 'AÇIK')}
                                    title="Soruyu atla ve açık bırak"
                                  >
                                    Açık
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type={question.questionType === 'NUMBER' ? 'number' : 'text'}
                                    value={currentAnswer === 'AÇIK' ? '' : currentAnswer}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Cevabınızı girin..."
                                    disabled={currentAnswer === 'AÇIK'}
                                  />
                                  <Button
                                    type="button"
                                    variant={currentAnswer === 'AÇIK' ? 'default' : 'outline'}
                                    className={`h-12 px-4 ${currentAnswer === 'AÇIK' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-300 text-amber-600 hover:bg-amber-50'}`}
                                    onClick={() => handleAnswerChange(question.id, 'AÇIK')}
                                    title="Soruyu atla ve açık bırak"
                                  >
                                    Açık
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {index < currentProcess.checklistTemplate!.questions.length - 1 && (
                            <Separator className="ml-9 bg-slate-200" />
                          )}
                        </div>
                      )
                    })}

                    {currentProcess.status !== 'COMPLETED' && (
                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={handleSaveAnswers}
                          disabled={saving}
                          className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Answers'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Battery className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium">Select a process</p>
                <p className="text-slate-500">
                  Click on a process with a checklist to view or fill out the questions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Notes */}
      {batteryBox.notes && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">{batteryBox.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
