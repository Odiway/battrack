import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (search) {
      where.serialNumber = { contains: search, mode: 'insensitive' }
    }

    const batteryBoxes = await prisma.batteryBox.findMany({
      where,
      include: {
        processes: {
          include: {
            process: true,
            checklistTemplate: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(batteryBoxes)
  } catch (error) {
    console.error('Error fetching battery boxes:', error)
    return NextResponse.json({ error: 'Failed to fetch battery boxes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serialNumber, notes, selectedProcesses } = await request.json()

    if (!serialNumber) {
      return NextResponse.json({ error: 'Serial number is required' }, { status: 400 })
    }

    if (!selectedProcesses || selectedProcesses.length === 0) {
      return NextResponse.json({ error: 'At least one process must be selected' }, { status: 400 })
    }

    // Create battery box with selected processes
    const batteryBox = await prisma.batteryBox.create({
      data: {
        serialNumber,
        notes,
        processes: {
          create: selectedProcesses.map((sp: { processId: string; checklistTemplateId?: string }, index: number) => ({
            processId: sp.processId,
            checklistTemplateId: sp.checklistTemplateId || null,
            displayOrder: index,
            // If no checklist is required (no template), auto-complete the process
            status: sp.checklistTemplateId ? 'PENDING' : 'COMPLETED',
            completedAt: sp.checklistTemplateId ? null : new Date(),
          })),
        },
      },
      include: {
        processes: {
          include: {
            process: true,
            checklistTemplate: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    // Check if all processes are completed (no checklists required)
    const allCompleted = batteryBox.processes.every((p: { status: string }) => p.status === 'COMPLETED')
    if (allCompleted) {
      await prisma.batteryBox.update({
        where: { id: batteryBox.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })
    }

    return NextResponse.json(batteryBox)
  } catch (error) {
    console.error('Error creating battery box:', error)
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Serial number already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create battery box' }, { status: 500 })
  }
}
