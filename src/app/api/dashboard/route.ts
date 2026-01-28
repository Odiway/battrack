import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Use sequential queries to avoid overwhelming the local dev server
    const totalBatteryBoxes = await prisma.batteryBox.count()
    const inProgressBoxes = await prisma.batteryBox.count({ where: { status: 'IN_PROGRESS' } })
    const completedBoxes = await prisma.batteryBox.count({ where: { status: 'COMPLETED' } })
    const totalProcesses = await prisma.process.count({ where: { active: true } })
    
    const recentBatteryBoxes = await prisma.batteryBox.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        processes: {
          include: {
            process: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    // Calculate process completion stats
    const processStats = await prisma.batteryBoxProcess.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    return NextResponse.json({
      totalBatteryBoxes,
      inProgressBoxes,
      completedBoxes,
      totalProcesses,
      recentBatteryBoxes,
      processStats: processStats.reduce((acc: Record<string, number>, stat: { status: string; _count: { status: number } }) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
