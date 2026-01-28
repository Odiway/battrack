import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const defect = await prisma.defectLog.findUnique({
      where: { id },
      include: {
        batteryBox: true,
        checklistAnswer: {
          include: {
            question: true,
            answeredBy: { select: { name: true, email: true } },
            batteryBoxProcess: {
              include: {
                process: true,
              },
            },
          },
        },
        resolvedBy: { select: { name: true, email: true } },
      },
    })

    if (!defect) {
      return NextResponse.json({ error: 'Defect not found' }, { status: 404 })
    }

    return NextResponse.json(defect)
  } catch (error) {
    console.error('Error fetching defect:', error)
    return NextResponse.json({ error: 'Failed to fetch defect' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only QUALITY and ADMIN can update defects
    if (session.role !== 'QUALITY' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const { status, severity, notes } = body

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (severity) updateData.severity = severity
    if (notes !== undefined) updateData.notes = notes

    // If status is being resolved/closed, set resolvedBy and resolvedAt
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedById = session.userId
      updateData.resolvedAt = new Date()
    }

    const updated = await prisma.defectLog.update({
      where: { id },
      data: updateData,
      include: {
        batteryBox: { select: { serialNumber: true } },
        resolvedBy: { select: { name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating defect:', error)
    return NextResponse.json({ error: 'Failed to update defect' }, { status: 500 })
  }
}
