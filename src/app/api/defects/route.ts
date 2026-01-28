import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category
    if (severity) where.severity = severity

    const defects = await prisma.defectLog.findMany({
      where,
      include: {
        batteryBox: {
          select: { serialNumber: true },
        },
        checklistAnswer: {
          include: {
            batteryBoxProcess: {
              include: {
                process: { select: { name: true } },
              },
            },
            answeredBy: { select: { name: true } },
          },
        },
        resolvedBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(defects)
  } catch (error) {
    console.error('Error fetching defects:', error)
    return NextResponse.json({ error: 'Failed to fetch defects' }, { status: 500 })
  }
}
