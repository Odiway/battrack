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
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2 } from 'lucide-react'
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBatteryBox()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  async function fetchBatteryBox() {
    try {
      const res = await fetch('/api/battery-boxes/' + resolvedParams.id)
      if (!res.ok) throw new Error()

      const data: BatteryBox = await res.json()
      setBatteryBox(data)

      const inProgress = data.processes.find((p) => p.status === 'IN_PROGRESS')
      const pending = data.processes.find(
        (p) => p.status === 'PENDING' && p.checklistTemplate,
      )

      if (inProgress && inProgress.checklistTemplate) {
        setActiveProcess(inProgress.processId)
        initializeAnswers(inProgress)
      } else if (pending) {
        setActiveProcess(pending.processId)
      } else {
        setActiveProcess(null)
      }
    } catch {
      toast.error('Battery box not found')
      router.push('/battery-boxes')
    } finally {
      setLoading(false)
    }
  }

  function initializeAnswers(process: BatteryBoxProcess) {
    if (!process.checklistTemplate) return

    const initial: Record<string, string> = {}
    for (const a of process.answers) {
      initial[a.questionId] = a.answer
    }
    setAnswers(initial)
  }

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSaveAnswers() {
    if (!batteryBox || !activeProcess) return

    const process = batteryBox.processes.find(
      (p) => p.processId === activeProcess,
    )
    if (!process || !process.checklistTemplate) return

    setSaving(true)
    try {
      const payload = Object.entries(answers)
        .filter(([, v]) => v !== '')
        .map(([questionId, answer]) => ({ questionId, answer }))

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

  const currentProcess = activeProcess
    ? batteryBox.processes.find((p) => p.processId === activeProcess)
    : null

  const checklistTemplate = currentProcess?.checklistTemplate ?? null

  const completedCount = batteryBox.processes.filter(
    (p) => p.status === 'COMPLETED',
  ).length
  const progress = calculateProgress(
    completedCount,
    batteryBox.processes.length,
  )

  return (
    <div className='space-y-6'>
      {/* HEADER */}
      <div className='relative rounded-xl bg-slate-900 p-6 overflow-hidden'>
        <CircuitPattern className='absolute inset-0 opacity-10 text-emerald-500' />
        <GlowLine position='top' color='cyan' />

        <div className='relative flex items-center gap-4'>
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
      </div>

      {/* PROGRESS */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex justify-between text-sm mb-2'>
            <span>Progress</span>
            <span>
              {completedCount}/{batteryBox.processes.length}
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
      {currentProcess && checklistTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>{currentProcess.process.name}</CardTitle>
            <CardDescription>{checklistTemplate.name}</CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {checklistTemplate.questions.map((q, i) => {
              const value = answers[q.id] ?? ''

              return (
                <div key={q.id} className='space-y-3'>
                  <div className='flex gap-3'>
                    <span className='w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm'>
                      {i + 1}
                    </span>
                    <p className='font-medium'>{q.questionText}</p>
                  </div>

                  <div className='ml-9'>
                    {q.questionType === 'YES_NO' ? (
                      <div className='flex gap-2'>
                        {['KABUL', 'RED', 'OPEN'].map((v) => (
                          <Button
                            key={v}
                            variant={value === v ? 'default' : 'outline'}
                            onClick={() => handleAnswerChange(q.id, v)}
                          >
                            {v}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={q.questionType === 'NUMBER' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) =>
                          handleAnswerChange(q.id, e.target.value)
                        }
                        className='w-full h-11 px-4 border rounded-lg'
                      />
                    )}
                  </div>

                  {i < checklistTemplate.questions.length - 1 && (
                    <Separator className='ml-9' />
                  )}
                </div>
              )
            })}

            <Button onClick={handleSaveAnswers} disabled={saving}>
              {saving ? 'Saving...' : 'Save Answers'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
