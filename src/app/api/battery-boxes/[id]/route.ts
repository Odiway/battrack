import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const batteryBox = await prisma.batteryBox.findUnique({
      where: { id },
      include: {
        processes: {
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
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    if (!batteryBox) {
      return NextResponse.json({ error: 'Battery box not found' }, { status: 404 })
    }

    return NextResponse.json(batteryBox)
  } catch (error) {
    console.error('Error fetching battery box:', error)
    return NextResponse.json({ error: 'Failed to fetch battery box' }, { status: 500 })
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
    
    await prisma.batteryBox.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting battery box:', error)
    return NextResponse.json({ error: 'Failed to delete battery box' }, { status: 500 })
  }
}
