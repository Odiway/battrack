import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const processes = await prisma.process.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    })
    return NextResponse.json(processes)
  } catch (error) {
    console.error('Error fetching processes:', error)
    return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, checklistRequired, displayOrder } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const process = await prisma.process.create({
      data: {
        name,
        description,
        checklistRequired: checklistRequired ?? false,
        displayOrder: displayOrder ?? 0,
      },
    })

    return NextResponse.json(process)
  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json({ error: 'Failed to create process' }, { status: 500 })
  }
}
