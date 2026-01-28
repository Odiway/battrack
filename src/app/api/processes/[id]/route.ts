import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const process = await prisma.process.findUnique({
      where: { id },
    })
    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }
    return NextResponse.json(process)
  } catch (error) {
    console.error('Error fetching process:', error)
    return NextResponse.json({ error: 'Failed to fetch process' }, { status: 500 })
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
    const { name, description, checklistRequired, displayOrder, active } = await request.json()

    const process = await prisma.process.update({
      where: { id },
      data: {
        name,
        description,
        checklistRequired,
        displayOrder,
        active,
      },
    })

    return NextResponse.json(process)
  } catch (error) {
    console.error('Error updating process:', error)
    return NextResponse.json({ error: 'Failed to update process' }, { status: 500 })
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
    
    // Soft delete by setting active to false
    await prisma.process.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting process:', error)
    return NextResponse.json({ error: 'Failed to delete process' }, { status: 500 })
  }
}
