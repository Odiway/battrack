import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get date range for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Total defects by status
    const defectsByStatus = await prisma.defectLog.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // Defects by category
    const defectsByCategory = await prisma.defectLog.groupBy({
      by: ['category'],
      _count: { id: true },
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { _count: { id: 'desc' } },
    })

    // Defects by severity
    const defectsBySeverity = await prisma.defectLog.groupBy({
      by: ['severity'],
      _count: { id: true },
      where: {
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    })

    // Recent defects (last 10)
    const recentDefects = await prisma.defectLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        batteryBox: { select: { serialNumber: true } },
        checklistAnswer: {
          include: {
            answeredBy: { select: { name: true } },
            batteryBoxProcess: {
              include: {
                process: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    // Daily defect trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const dailyDefects = await prisma.defectLog.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        category: true,
      },
    })

    // Group by date
    const dailyTrend: Record<string, number> = {}
    dailyDefects.forEach((d: { createdAt: Date; category: string }) => {
      const dateKey = d.createdAt.toISOString().split('T')[0]
      dailyTrend[dateKey] = (dailyTrend[dateKey] || 0) + 1
    })

    // Total counts
    const totalOpen = await prisma.defectLog.count({
      where: { status: 'OPEN' },
    })

    const totalInReview = await prisma.defectLog.count({
      where: { status: 'IN_REVIEW' },
    })

    const totalResolved = await prisma.defectLog.count({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    })

    const criticalCount = await prisma.defectLog.count({
      where: {
        severity: 'CRITICAL',
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    })

    const highCount = await prisma.defectLog.count({
      where: {
        severity: 'HIGH',
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    })

    // Battery boxes with most defects
    const boxesWithMostDefects = await prisma.defectLog.groupBy({
      by: ['batteryBoxId'],
      _count: { id: true },
      where: {
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    })

    // Get battery box details
    const boxIds = boxesWithMostDefects.map((b: { batteryBoxId: string }) => b.batteryBoxId)
    const boxes = await prisma.batteryBox.findMany({
      where: { id: { in: boxIds } },
      select: { id: true, serialNumber: true },
    })

    const topDefectBoxes = boxesWithMostDefects.map((b: { batteryBoxId: string; _count: { id: number } }) => ({
      serialNumber: boxes.find((box) => box.id === b.batteryBoxId)?.serialNumber || 'Unknown',
      count: b._count.id,
    }))

    return NextResponse.json({
      summary: {
        totalOpen,
        totalInReview,
        totalResolved,
        criticalCount,
        highCount,
      },
      defectsByStatus: defectsByStatus.map((d: { status: string; _count: { id: number } }) => ({
        status: d.status,
        count: d._count.id,
      })),
      defectsByCategory: defectsByCategory.map((d: { category: string; _count: { id: number } }) => ({
        category: d.category,
        count: d._count.id,
      })),
      defectsBySeverity: defectsBySeverity.map((d: { severity: string; _count: { id: number } }) => ({
        severity: d.severity,
        count: d._count.id,
      })),
      dailyTrend: Object.entries(dailyTrend).map(([date, count]) => ({
        date,
        count,
      })).sort((a, b) => a.date.localeCompare(b.date)),
      recentDefects,
      topDefectBoxes,
    })
  } catch (error) {
    console.error('Error fetching defect stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
