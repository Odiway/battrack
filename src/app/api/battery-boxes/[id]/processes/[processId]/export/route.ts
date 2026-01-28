import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

interface AnswerWithUser {
  answeredBy: { name: string } | null
  questionId: string
  answer: string
  answeredAt: Date
}

interface Question {
  id: string
  questionText: string
}

interface BatteryBoxProcessWithRelations {
  id: string
  status: string
  startedAt: Date | null
  completedAt: Date | null
  batteryBox: { serialNumber: string }
  process: { name: string }
  checklistTemplate: { name: string; questions: Question[] } | null
  answers: AnswerWithUser[]
}

// Helper function for fill patterns
function createFill(argbColor: string): ExcelJS.Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: argbColor }
  } as ExcelJS.Fill
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; processId: string }> }
) {
  try {
    const { id, processId } = await params

    const batteryBoxProcess = await prisma.batteryBoxProcess.findUnique({
      where: {
        batteryBoxId_processId: {
          batteryBoxId: id,
          processId: processId,
        },
      },
      include: {
        batteryBox: true,
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
              select: { name: true },
            },
          },
        },
      },
    }) as unknown as BatteryBoxProcessWithRelations | null

    if (!batteryBoxProcess) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'TEMSA - TrackBat Manufacturing System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Kontrol Planı')

    // TEMSA blue color
    const temsaBlue = '0066B3'
    const lightGray = 'F2F2F2'
    const mediumGray = 'D9D9D9'

    // Set column widths for TEMSA format
    worksheet.getColumn(1).width = 5   // NO
    worksheet.getColumn(2).width = 18  // KONTROL
    worksheet.getColumn(3).width = 45  // KONTROL AÇIKLAMASI
    worksheet.getColumn(4).width = 40  // KABUL KRİTERİ
    worksheet.getColumn(5).width = 18  // EKİPMAN
    worksheet.getColumn(6).width = 15  // FREKANS
    worksheet.getColumn(7).width = 12  // SONUÇ
    worksheet.getColumn(8).width = 25  // AÇIKLAMA

    // ===== ROW 1: TEMSA Logo area and Title =====
    worksheet.mergeCells('A1:B3')
    const logoCell = worksheet.getCell('A1')
    logoCell.value = 'TEMSA'
    logoCell.font = { bold: true, size: 24, color: { argb: temsaBlue } }
    logoCell.alignment = { horizontal: 'center', vertical: 'middle' }
    logoCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }

    // Main Title
    worksheet.mergeCells('C1:F3')
    const titleCell = worksheet.getCell('C1')
    titleCell.value = 'BATARYA KUTUSU KONTROL PLANI'
    titleCell.font = { bold: true, size: 18, color: { argb: temsaBlue } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    titleCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    }

    // Date/Page section
    worksheet.mergeCells('G1:H1')
    worksheet.getCell('G1').value = `Date / Tarih: ${new Date().toLocaleDateString('tr-TR')}`
    worksheet.getCell('G1').font = { size: 10 }
    worksheet.getCell('G1').alignment = { horizontal: 'right' }
    worksheet.getCell('G1').border = { top: { style: 'thin' }, right: { style: 'thin' } }

    worksheet.mergeCells('G2:H2')
    worksheet.getCell('G2').value = 'Page / Sayfa: 1'
    worksheet.getCell('G2').font = { size: 10 }
    worksheet.getCell('G2').alignment = { horizontal: 'right' }
    worksheet.getCell('G2').border = { right: { style: 'thin' } }

    worksheet.mergeCells('G3:H3')
    worksheet.getCell('G3').border = { bottom: { style: 'thin' }, right: { style: 'thin' } }

    // ===== ROW 4: Info row =====
    worksheet.getCell('A4').value = 'PARÇA NO:'
    worksheet.getCell('A4').font = { bold: true, size: 9, color: { argb: temsaBlue } }
    worksheet.getCell('B4').value = batteryBoxProcess.batteryBox.serialNumber
    worksheet.getCell('B4').font = { size: 9 }

    worksheet.getCell('C4').value = 'PROJE ADI:'
    worksheet.getCell('C4').font = { bold: true, size: 9, color: { argb: temsaBlue } }
    worksheet.getCell('D4').value = batteryBoxProcess.process.name
    worksheet.getCell('D4').font = { size: 9 }

    worksheet.getCell('E4').value = 'DURUM:'
    worksheet.getCell('E4').font = { bold: true, size: 9, color: { argb: temsaBlue } }
    worksheet.getCell('F4').value = batteryBoxProcess.status === 'COMPLETED' ? 'TAMAMLANDI' : 
                                    batteryBoxProcess.status === 'IN_PROGRESS' ? 'DEVAM EDİYOR' : 'BEKLEMEDE'
    worksheet.getCell('F4').font = { size: 9 }

    // Apply border to row 4
    for (let col = 1; col <= 8; col++) {
      worksheet.getCell(4, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }

    // ===== ROW 5: Table Header =====
    const headerRow = 5
    const headers = ['NO', 'KONTROL', 'KONTROL AÇIKLAMASI', 'KABUL KRİTERİ', 'EKİPMAN', 'FREKANS', 'SONUÇ', 'AÇIKLAMA']
    
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(headerRow, index + 1)
      cell.value = header
      cell.font = { bold: true, size: 10, color: { argb: temsaBlue } }
      cell.fill = createFill(mediumGray)
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    worksheet.getRow(headerRow).height = 25

    // ===== DATA ROWS =====
    const questions = batteryBoxProcess.checklistTemplate?.questions || []
    let rowIndex = headerRow + 1
    let currentKontrol = ''
    let kontrolStartRow = rowIndex

    // Group questions by control type (detect from question text)
    questions.forEach((question, index) => {
      const answer = batteryBoxProcess.answers.find(a => a.questionId === question.id)
      
      // Determine control category based on question content
      let kontrolType = 'GENEL KONTROL'
      const qText = question.questionText.toLowerCase()
      if (qText.includes('görsel') || qText.includes('çizik') || qText.includes('darbe') || qText.includes('çatlak')) {
        kontrolType = 'GÖRSEL KONTROL'
      } else if (qText.includes('montaj') || qText.includes('civata') || qText.includes('vida')) {
        kontrolType = 'MONTAJ KONTROL'
      } else if (qText.includes('elektrik') || qText.includes('voltaj') || qText.includes('sensör') || qText.includes('kablo')) {
        kontrolType = 'ELEKTRİKSEL KONTROL'
      } else if (qText.includes('test') || qText.includes('ölçüm') || qText.includes('basınç')) {
        kontrolType = 'TEST KONTROL'
      } else if (qText.includes('etiket') || qText.includes('barkod') || qText.includes('kod')) {
        kontrolType = 'ÜRÜN KOD KONTROL'
      }

      // NO column
      worksheet.getCell(`A${rowIndex}`).value = index + 1
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
      
      // KONTROL column
      worksheet.getCell(`B${rowIndex}`).value = kontrolType
      worksheet.getCell(`B${rowIndex}`).font = { size: 9, color: { argb: temsaBlue } }
      worksheet.getCell(`B${rowIndex}`).alignment = { vertical: 'middle', wrapText: true }
      
      // KONTROL AÇIKLAMASI column
      worksheet.getCell(`C${rowIndex}`).value = question.questionText
      worksheet.getCell(`C${rowIndex}`).alignment = { vertical: 'middle', wrapText: true }
      worksheet.getCell(`C${rowIndex}`).font = { size: 9 }
      
      // KABUL KRİTERİ column
      const isYesNo = question.questionText.toLowerCase().includes('mı') || question.questionText.toLowerCase().includes('mu')
      worksheet.getCell(`D${rowIndex}`).value = isYesNo ? 'Evet/Hayır onayı gerekli' : 'Spesifikasyona uygun olmalı'
      worksheet.getCell(`D${rowIndex}`).alignment = { vertical: 'middle', wrapText: true }
      worksheet.getCell(`D${rowIndex}`).font = { size: 9 }
      
      // EKİPMAN column
      worksheet.getCell(`E${rowIndex}`).value = 'GÖZ'
      worksheet.getCell(`E${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell(`E${rowIndex}`).font = { size: 9 }
      
      // FREKANS column
      worksheet.getCell(`F${rowIndex}`).value = 'HER SEVKİYATTA\nTÜM MALZEMELER'
      worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      worksheet.getCell(`F${rowIndex}`).font = { size: 8 }
      
      // SONUÇ column - with color coding
      const sonucCell = worksheet.getCell(`G${rowIndex}`)
      if (answer) {
        const isPositive = answer.answer.toLowerCase() === 'yes' || answer.answer.toLowerCase() === 'evet'
        sonucCell.value = isPositive ? 'KABUL' : 'RED'
        sonucCell.font = { bold: true, size: 10, color: { argb: isPositive ? '008000' : 'FF0000' } }
        sonucCell.fill = createFill(isPositive ? 'C6EFCE' : 'FFC7CE')
      } else {
        sonucCell.value = '-'
        sonucCell.font = { size: 10 }
      }
      sonucCell.alignment = { horizontal: 'center', vertical: 'middle' }
      
      // AÇIKLAMA column
      worksheet.getCell(`H${rowIndex}`).value = answer?.answeredBy?.name 
        ? `${answer.answeredBy.name} - ${new Date(answer.answeredAt).toLocaleDateString('tr-TR')}`
        : ''
      worksheet.getCell(`H${rowIndex}`).alignment = { vertical: 'middle', wrapText: true }
      worksheet.getCell(`H${rowIndex}`).font = { size: 8 }

      // Apply borders and alternating row colors
      for (let col = 1; col <= 8; col++) {
        const cell = worksheet.getCell(rowIndex, col)
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
        // Alternating row color
        if (index % 2 === 1 && col !== 7) { // Skip SONUÇ column for fill
          cell.fill = createFill(lightGray)
        }
      }

      worksheet.getRow(rowIndex).height = 30
      rowIndex++
    })

    // ===== FOOTER: Signature section =====
    rowIndex += 1

    // HAZIRLAYAN row
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`)
    worksheet.getCell(`A${rowIndex}`).value = 'HAZIRLAYAN'
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 10 }
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell(`A${rowIndex}`).fill = createFill(mediumGray)
    
    worksheet.mergeCells(`C${rowIndex}:E${rowIndex}`)
    worksheet.getCell(`C${rowIndex}`).value = 'TEKNİSYEN'
    worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    
    worksheet.mergeCells(`F${rowIndex}:H${rowIndex}`)
    worksheet.getCell(`F${rowIndex}`).value = 'İMZA:'
    worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'right', vertical: 'middle' }

    for (let col = 1; col <= 8; col++) {
      worksheet.getCell(rowIndex, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }
    rowIndex++

    // KONTROL EDEN row
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`)
    worksheet.getCell(`A${rowIndex}`).value = 'KONTROL EDEN'
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 10 }
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell(`A${rowIndex}`).fill = createFill(mediumGray)
    
    worksheet.mergeCells(`C${rowIndex}:E${rowIndex}`)
    worksheet.getCell(`C${rowIndex}`).value = 'POSTABAŞI'
    worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    
    worksheet.mergeCells(`F${rowIndex}:H${rowIndex}`)
    worksheet.getCell(`F${rowIndex}`).value = 'İMZA:'
    worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'right', vertical: 'middle' }

    for (let col = 1; col <= 8; col++) {
      worksheet.getCell(rowIndex, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }
    rowIndex++

    // ONAY VEREN row
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`)
    worksheet.getCell(`A${rowIndex}`).value = 'ONAY VEREN'
    worksheet.getCell(`A${rowIndex}`).font = { bold: true, size: 10 }
    worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    worksheet.getCell(`A${rowIndex}`).fill = createFill(mediumGray)
    
    worksheet.mergeCells(`C${rowIndex}:E${rowIndex}`)
    worksheet.getCell(`C${rowIndex}`).value = 'MÜHENDİS'
    worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: 'center', vertical: 'middle' }
    
    worksheet.mergeCells(`F${rowIndex}:H${rowIndex}`)
    worksheet.getCell(`F${rowIndex}`).value = 'İMZA:'
    worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: 'right', vertical: 'middle' }

    for (let col = 1; col <= 8; col++) {
      worksheet.getCell(rowIndex, col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    }

    // Set print area and page setup
    worksheet.pageSetup.orientation = 'landscape'
    worksheet.pageSetup.fitToPage = true
    worksheet.pageSetup.fitToWidth = 1
    worksheet.pageSetup.fitToHeight = 0
    worksheet.pageSetup.margins = {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Create safe filename (remove special chars)
    const safeSerial = batteryBoxProcess.batteryBox.serialNumber.replace(/[^a-zA-Z0-9-_]/g, '_')
    const safeProcess = batteryBoxProcess.process.name.replace(/[^a-zA-Z0-9-_]/g, '_')
    const filename = `TEMSA_${safeSerial}_${safeProcess}_Kontrol_Plani.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting checklist:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to export checklist', details: errorMessage }, { status: 500 })
  }
}
