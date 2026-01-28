import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = await prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, description, questions, active } = await request.json()

    // Update template
    const template = await prisma.checklistTemplate.update({
      where: { id },
      data: {
        name,
        description,
        active,
      },
    })

    // If questions are provided, replace them
    if (questions) {
      // Delete existing questions
      await prisma.checklistQuestion.deleteMany({
        where: { checklistTemplateId: id },
      })

      // Create new questions
      await prisma.checklistQuestion.createMany({
        data: questions.map((q: { questionText: string; questionType?: string; required?: boolean }, index: number) => ({
          checklistTemplateId: id,
          questionText: q.questionText,
          questionType: q.questionType || 'YES_NO',
          required: q.required ?? true,
          displayOrder: index,
        })),
      })
    }

    // Fetch updated template with questions
    const updatedTemplate = await prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Soft delete
    await prisma.checklistTemplate.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
