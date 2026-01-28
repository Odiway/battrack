import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: { active: true },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, questions } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        name,
        description,
        questions: questions?.length
          ? {
              create: questions.map((q: { questionText: string; questionType?: string; required?: boolean }, index: number) => ({
                questionText: q.questionText,
                questionType: q.questionType || 'YES_NO',
                required: q.required ?? true,
                displayOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
