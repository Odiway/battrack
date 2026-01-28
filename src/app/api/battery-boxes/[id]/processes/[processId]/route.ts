import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Helper function to determine defect category from question text
function determineDefectCategory(questionText: string): { category: string; subcategory: string | null } {
  const qText = questionText.toLowerCase()
  
  if (qText.includes('görsel') || qText.includes('çizik') || qText.includes('darbe') || qText.includes('çatlak') || qText.includes('deformasyon')) {
    return { category: 'GÖRSEL KONTROL', subcategory: 'Yüzey Hasarı' }
  }
  if (qText.includes('montaj') || qText.includes('civata') || qText.includes('vida') || qText.includes('sıkma') || qText.includes('tork')) {
    return { category: 'MONTAJ KONTROL', subcategory: 'Mekanik Bağlantı' }
  }
  if (qText.includes('elektrik') || qText.includes('voltaj') || qText.includes('sensör') || qText.includes('kablo') || qText.includes('bağlantı')) {
    return { category: 'ELEKTRİKSEL KONTROL', subcategory: 'Elektrik Sistemi' }
  }
  if (qText.includes('test') || qText.includes('ölçüm') || qText.includes('basınç') || qText.includes('sızdırmazlık')) {
    return { category: 'TEST KONTROL', subcategory: 'Performans Testi' }
  }
  if (qText.includes('etiket') || qText.includes('barkod') || qText.includes('kod') || qText.includes('seri')) {
    return { category: 'ÜRÜN KOD KONTROL', subcategory: 'İzlenebilirlik' }
  }
  if (qText.includes('soğutma') || qText.includes('termal') || qText.includes('sıcaklık')) {
    return { category: 'TERMAL KONTROL', subcategory: 'Soğutma Sistemi' }
  }
  if (qText.includes('bms') || qText.includes('bmu') || qText.includes('bcu')) {
    return { category: 'BMS KONTROL', subcategory: 'Batarya Yönetimi' }
  }
  if (qText.includes('modül') || qText.includes('hücre') || qText.includes('cell')) {
    return { category: 'MODÜL KONTROL', subcategory: 'Batarya Modülü' }
  }
  
  return { category: 'GENEL KONTROL', subcategory: null }
}

// Helper to determine severity based on keywords
function determineDefectSeverity(questionText: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const qText = questionText.toLowerCase()
  
  if (qText.includes('güvenlik') || qText.includes('izolasyon') || qText.includes('kısa devre') || qText.includes('yangın')) {
    return 'CRITICAL'
  }
  if (qText.includes('elektrik') || qText.includes('voltaj') || qText.includes('bms') || qText.includes('sızdırmazlık')) {
    return 'HIGH'
  }
  if (qText.includes('montaj') || qText.includes('bağlantı') || qText.includes('tork')) {
    return 'MEDIUM'
  }
  
  return 'LOW'
}

// Start a process
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; processId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, processId } = await params

    const batteryBoxProcess = await prisma.batteryBoxProcess.findUnique({
      where: {
        batteryBoxId_processId: {
          batteryBoxId: id,
          processId: processId,
        },
      },
    })

    if (!batteryBoxProcess) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    if (batteryBoxProcess.status !== 'PENDING') {
      return NextResponse.json({ error: 'Process already started' }, { status: 400 })
    }

    const updated = await prisma.batteryBoxProcess.update({
      where: { id: batteryBoxProcess.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        process: true,
        checklistTemplate: {
          include: {
            questions: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error starting process:', error)
    return NextResponse.json({ error: 'Failed to start process' }, { status: 500 })
  }
}

// Save checklist answers
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; processId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, processId } = await params
    const { answers } = await request.json()

    const batteryBoxProcess = await prisma.batteryBoxProcess.findUnique({
      where: {
        batteryBoxId_processId: {
          batteryBoxId: id,
          processId: processId,
        },
      },
      include: {
        checklistTemplate: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!batteryBoxProcess) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Auto-start if still pending
    if (batteryBoxProcess.status === 'PENDING') {
      await prisma.batteryBoxProcess.update({
        where: { id: batteryBoxProcess.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      })
    }

    // Save each answer and create defect logs for negative answers
    for (const answer of answers as { questionId: string; answer: string }[]) {
      const savedAnswer = await prisma.checklistAnswer.upsert({
        where: {
          batteryBoxProcessId_questionId: {
            batteryBoxProcessId: batteryBoxProcess.id,
            questionId: answer.questionId,
          },
        },
        create: {
          batteryBoxProcessId: batteryBoxProcess.id,
          questionId: answer.questionId,
          answer: answer.answer,
          answeredById: session.userId,
        },
        update: {
          answer: answer.answer,
          answeredById: session.userId,
          answeredAt: new Date(),
        },
        include: {
          question: true,
        },
      })

      // Check if answer is negative (No/Hayır/no/hayır/false)
      const isNegativeAnswer = ['no', 'hayır', 'hayir', 'false', 'red', 'reject'].includes(answer.answer.toLowerCase())
      
      if (isNegativeAnswer) {
        // Create or update defect log
        const { category, subcategory } = determineDefectCategory(savedAnswer.question.questionText)
        const severity = determineDefectSeverity(savedAnswer.question.questionText)
        
        await prisma.defectLog.upsert({
          where: {
            checklistAnswerId: savedAnswer.id,
          },
          create: {
            checklistAnswerId: savedAnswer.id,
            batteryBoxId: id,
            category,
            subcategory,
            description: savedAnswer.question.questionText,
            severity,
            status: 'OPEN',
          },
          update: {
            category,
            subcategory,
            description: savedAnswer.question.questionText,
            severity,
            status: 'OPEN',
            updatedAt: new Date(),
          },
        })
      } else {
        // If answer changed to positive, close any existing defect
        const existingDefect = await prisma.defectLog.findUnique({
          where: { checklistAnswerId: savedAnswer.id },
        })
        
        if (existingDefect) {
          await prisma.defectLog.update({
            where: { id: existingDefect.id },
            data: {
              status: 'CLOSED',
              resolvedAt: new Date(),
              notes: 'Otomatik kapatıldı - Cevap pozitife değişti',
            },
          })
        }
      }
    }

    // Check if all required questions are answered
    const totalQuestions = batteryBoxProcess.checklistTemplate?.questions.filter((q: { required: boolean }) => q.required).length || 0
    const answeredCount = await prisma.checklistAnswer.count({
      where: {
        batteryBoxProcessId: batteryBoxProcess.id,
        question: { required: true },
      },
    })

    // If all questions answered, mark process as completed
    if (answeredCount >= totalQuestions && totalQuestions > 0) {
      await prisma.batteryBoxProcess.update({
        where: { id: batteryBoxProcess.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      // Check if all processes for this battery box are completed
      const allProcesses = await prisma.batteryBoxProcess.findMany({
        where: { batteryBoxId: id },
      })

      const allCompleted = allProcesses.every((p: { id: string; status: string }) => 
        p.id === batteryBoxProcess.id ? true : p.status === 'COMPLETED'
      )

      if (allCompleted) {
        await prisma.batteryBox.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })
      }
    }

    // Fetch updated process
    const updated = await prisma.batteryBoxProcess.findUnique({
      where: { id: batteryBoxProcess.id },
      include: {
        process: true,
        checklistTemplate: {
          include: {
            questions: {
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        answers: {
          include: {
            question: true,
            answeredBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error saving answers:', error)
    return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 })
  }
}
