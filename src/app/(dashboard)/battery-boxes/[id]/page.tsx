'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
  Zap,
} from 'lucide-react'
import { formatDate, calculateProgress } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface Question {
  id: string
  questionText: string
  questionType: 'YES_NO' | 'TEXT' | 'NUMBER'
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
  displayOrder: number
  startedAt: string | null
  completedAt: string | null
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
  params,
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
  const [buttonSelections, setButtonSelections] = useState<
    Record<string, string>
  >({})
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchBatteryBox()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  async function fetchBatteryBox() {
    try {
      const res = await fetch('/api/battery-boxes/' + resolvedParams.id)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBatteryBox(data)

      const inProgress = data.processes.find(
        (p: BatteryBoxProcess) => p.status === 'IN_PROGRESS',
      )
      const pending = data.processes.find(
        (p: BatteryBoxProcess) => p.status === 'PENDING' && p.checklistTemplate,
      )

      if (inProgress) {
        setActiveProcess(inProgress.processId)
        initializeAnswers(inProgress)
      } else if (pending) {
        setActiveProcess(pending.processId)
      }
    } catch {
      toast.error('Battery box not found')
      router.push('/battery-boxes')
    } finally {
      setLoading(false)
    }
  }

  function initializeAnswers(process: BatteryBoxProcess) {
    const initial: Record<string, string> = {}
    const buttons: Record<string, string> = {}
    process.answers.forEach((a) => {
      initial[a.questionId] = a.answer
      // Check if answer is one of the button values
      if (['AÇIK', 'RED', 'KABUL'].includes(a.answer)) {
        buttons[a.questionId] = a.answer
      }
    })
    setAnswers(initial)
    setButtonSelections(buttons)
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleButtonSelect(questionId: string, buttonValue: string) {
    setButtonSelections((prev) => ({ ...prev, [questionId]: buttonValue }))
  }

  async function handleDownloadExcel() {
    if (!batteryBox) return

    setDownloading(true)
    try {
      const res = await fetch(
        `/api/battery-boxes/${resolvedParams.id}/export`,
        { method: 'GET' },
      )

      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${batteryBox.serialNumber}_report.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Excel downloaded successfully')
    } catch {
      toast.error('Failed to download Excel')
    } finally {
      setDownloading(false)
    }
  }

  async function handleSaveAnswers() {
    if (!activeProcess) return
    const process = batteryBox?.processes.find(
      (p) => p.processId === activeProcess,
    )
    if (!process?.checklistTemplate) return

    setSaving(true)
    try {
      const payload = Object.entries(answers)
        .filter(([, v]) => v)
        .map(([questionId, answer]) => ({
          questionId,
          answer,
          buttonSelection: buttonSelections[questionId] || null,
        }))

      const res = await fetch(
        `/api/battery-boxes/${resolvedParams.id}/processes/${activeProcess}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: payload }),
        },
      )

      if (!res.ok) throw new Error()
      await fetchBatteryBox()
      toast.success('Answers saved')
    } catch {
      toast.error('Failed to save answers')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
      </div>
    )
  }

  if (!batteryBox) return null

  const currentProcess = batteryBox.processes.find(
    (p) => p.processId === activeProcess,
  )
  const completed = batteryBox.processes.filter(
    (p) => p.status === 'COMPLETED',
  ).length
  const progress = calculateProgress(completed, batteryBox.processes.length)

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='relative rounded-xl bg-slate-900 p-6 overflow-hidden'>
        <CircuitPattern className='absolute inset-0 opacity-10 text-emerald-500' />
        <GlowLine position='top' color='cyan' />

        <div className='relative flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/battery-boxes'>
              <Button size='icon' variant='ghost'>
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-white'>
                {batteryBox.serialNumber}
              </h1>
              <p className='text-slate-400 text-sm'>
                Created {formatDate(batteryBox.createdAt)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className='bg-emerald-600 hover:bg-emerald-700'
          >
            {downloading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Downloading...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Download Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* PROGRESS */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex justify-between text-sm mb-2'>
            <span>Progress</span>
            <span>
              {completed}/{batteryBox.processes.length}
            </span>
          </div>
          <div className='h-3 bg-slate-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-emerald-500 transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* CHECKLIST */}
      {currentProcess?.checklistTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>{currentProcess.process.name}</CardTitle>
            <CardDescription>
              {currentProcess.checklistTemplate.name}
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {currentProcess.checklistTemplate?.questions.map((q, i) => {
              const value = answers[q.id] || ''
              const selectedButton = buttonSelections[q.id] || ''

              return (
                <div key={q.id} className='space-y-3'>
                  <div className='flex gap-3'>
                    <span className='w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold shrink-0'>
                      {i + 1}
                    </span>
                    <div className='flex-1'>
                      <p className='font-medium text-slate-900'>
                        {q.questionText}
                      </p>
                      {q.required && (
                        <span className='text-xs text-red-500 mt-1 block'>
                          Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='ml-11 space-y-3'>
                    {/* Text/Number Input */}
                    <input
                      type={q.questionType === 'NUMBER' ? 'number' : 'text'}
                      value={value}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder='Enter your answer or measurement...'
                      className='w-full h-11 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                    />

                    {/* Three Buttons */}
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          selectedButton === 'AÇIK' ? 'default' : 'outline'
                        }
                        onClick={() => handleButtonSelect(q.id, 'AÇIK')}
                        className={
                          selectedButton === 'AÇIK'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : ''
                        }
                      >
                        AÇIK
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          selectedButton === 'RED' ? 'default' : 'outline'
                        }
                        onClick={() => handleButtonSelect(q.id, 'RED')}
                        className={
                          selectedButton === 'RED'
                            ? 'bg-red-600 hover:bg-red-700'
                            : ''
                        }
                      >
                        RED
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          selectedButton === 'KABUL' ? 'default' : 'outline'
                        }
                        onClick={() => handleButtonSelect(q.id, 'KABUL')}
                        className={
                          selectedButton === 'KABUL'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : ''
                        }
                      >
                        KABUL
                      </Button>
                    </div>
                  </div>

                  {i <
                    (currentProcess.checklistTemplate?.questions.length ?? 0) -
                      1 && <Separator className='ml-11 mt-4' />}
                </div>
              )
            })}

            <div className='flex gap-3 pt-4'>
              <Button
                onClick={handleSaveAnswers}
                disabled={saving}
                className='bg-emerald-600 hover:bg-emerald-700'
              >
                {saving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Answers'
                )}
              </Button>
              <Button
                onClick={handleDownloadExcel}
                disabled={downloading}
                variant='outline'
              >
                {downloading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className='mr-2 h-4 w-4' />
                    Download Excel
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
