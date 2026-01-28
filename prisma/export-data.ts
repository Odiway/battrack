import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as fs from 'fs'

async function exportData() {
  const pool = new pg.Pool({
    connectionString: 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable',
    max: 1,
  })
  
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Fetching data from local database...')
    
    // Fetch all data
    const users = await prisma.user.findMany()
    const processes = await prisma.process.findMany()
    const batteryBoxes = await prisma.batteryBox.findMany()
    const batteryBoxProcesses = await prisma.batteryBoxProcess.findMany()
    const checklistQuestions = await prisma.checklistQuestion.findMany()
    const checklistAnswers = await prisma.checklistAnswer.findMany()
    const defectLogs = await prisma.defectLog.findMany()

    console.log(`Found: ${users.length} users, ${processes.length} processes, ${batteryBoxes.length} battery boxes`)
    console.log(`${batteryBoxProcesses.length} battery box processes, ${checklistQuestions.length} questions`)
    console.log(`${checklistAnswers.length} answers, ${defectLogs.length} defect logs`)

    // Generate SQL
    let sql = '-- Export from local database\n-- Generated at ' + new Date().toISOString() + '\n\n'

    // Users
    if (users.length > 0) {
      sql += '-- Users\n'
      for (const u of users) {
        sql += `INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") VALUES ('${u.id}', '${u.email}', '${u.password}', '${u.name.replace(/'/g, "''")}', '${u.role}', '${u.createdAt.toISOString()}', '${u.updatedAt.toISOString()}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Processes
    if (processes.length > 0) {
      sql += '-- Processes\n'
      let idx = 1
      for (const p of processes) {
        if (!p.name) continue // Skip invalid
        const desc = p.description ? `'${p.description.replace(/'/g, "''")}'` : 'NULL'
        const orderIndex = p.orderIndex ?? idx++
        sql += `INSERT INTO "Process" ("id", "name", "description", "orderIndex", "createdAt", "updatedAt") VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', ${desc}, ${orderIndex}, '${p.createdAt.toISOString()}', '${p.updatedAt.toISOString()}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Battery Boxes
    if (batteryBoxes.length > 0) {
      sql += '-- Battery Boxes\n'
      for (const b of batteryBoxes) {
        const currentProcessId = b.currentProcessId ? `'${b.currentProcessId}'` : 'NULL'
        const completedAt = b.completedAt ? `'${b.completedAt.toISOString()}'` : 'NULL'
        sql += `INSERT INTO "BatteryBox" ("id", "serialNumber", "status", "currentProcessId", "createdAt", "updatedAt", "completedAt") VALUES ('${b.id}', '${b.serialNumber}', '${b.status}', ${currentProcessId}, '${b.createdAt.toISOString()}', '${b.updatedAt.toISOString()}', ${completedAt}) ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Checklist Questions - skip invalid ones
    if (checklistQuestions.length > 0) {
      sql += '-- Checklist Questions\n'
      let qIdx = 1
      for (const q of checklistQuestions) {
        // Skip questions with undefined processId or empty question
        if (!q.processId || q.processId === 'undefined' || !q.question) continue
        const question = q.question.replace(/'/g, "''")
        const orderIndex = q.orderIndex ?? qIdx++
        const isRequired = q.isRequired ?? true
        sql += `INSERT INTO "ChecklistQuestion" ("id", "processId", "question", "orderIndex", "isRequired", "createdAt", "updatedAt") VALUES ('${q.id}', '${q.processId}', '${question}', ${orderIndex}, ${isRequired}, '${q.createdAt.toISOString()}', '${q.updatedAt.toISOString()}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Battery Box Processes
    if (batteryBoxProcesses.length > 0) {
      sql += '-- Battery Box Processes\n'
      for (const bp of batteryBoxProcesses) {
        const startedAt = bp.startedAt ? `'${bp.startedAt.toISOString()}'` : 'NULL'
        const completedAt = bp.completedAt ? `'${bp.completedAt.toISOString()}'` : 'NULL'
        const operatorId = bp.operatorId ? `'${bp.operatorId}'` : 'NULL'
        const notes = bp.notes ? `'${bp.notes.replace(/'/g, "''")}'` : 'NULL'
        sql += `INSERT INTO "BatteryBoxProcess" ("id", "batteryBoxId", "processId", "status", "startedAt", "completedAt", "operatorId", "notes", "createdAt", "updatedAt") VALUES ('${bp.id}', '${bp.batteryBoxId}', '${bp.processId}', '${bp.status}', ${startedAt}, ${completedAt}, ${operatorId}, ${notes}, '${bp.createdAt.toISOString()}', '${bp.updatedAt.toISOString()}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Checklist Answers
    if (checklistAnswers.length > 0) {
      sql += '-- Checklist Answers\n'
      for (const a of checklistAnswers) {
        const answer = a.answer ? a.answer.replace(/'/g, "''") : ''
        const now = new Date().toISOString()
        const createdAt = a.createdAt ? a.createdAt.toISOString() : now
        const updatedAt = a.updatedAt ? a.updatedAt.toISOString() : now
        const answeredAt = a.answeredAt ? a.answeredAt.toISOString() : createdAt
        sql += `INSERT INTO "ChecklistAnswer" ("id", "batteryBoxProcessId", "questionId", "answer", "answeredById", "answeredAt", "createdAt", "updatedAt") VALUES ('${a.id}', '${a.batteryBoxProcessId}', '${a.questionId}', '${answer}', '${a.answeredById}', '${answeredAt}', '${createdAt}', '${updatedAt}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Defect Logs
    if (defectLogs.length > 0) {
      sql += '-- Defect Logs\n'
      for (const d of defectLogs) {
        const resolution = d.resolution ? `'${d.resolution.replace(/'/g, "''")}'` : 'NULL'
        const resolvedById = d.resolvedById ? `'${d.resolvedById}'` : 'NULL'
        const resolvedAt = d.resolvedAt ? `'${d.resolvedAt.toISOString()}'` : 'NULL'
        const description = d.description ? d.description.replace(/'/g, "''") : ''
        const category = d.category ? d.category.replace(/'/g, "''") : ''
        const createdAt = d.createdAt ? d.createdAt.toISOString() : new Date().toISOString()
        const updatedAt = d.updatedAt ? d.updatedAt.toISOString() : new Date().toISOString()
        sql += `INSERT INTO "DefectLog" ("id", "checklistAnswerId", "batteryBoxId", "description", "category", "severity", "status", "resolution", "resolvedById", "resolvedAt", "createdAt", "updatedAt") VALUES ('${d.id}', '${d.checklistAnswerId}', '${d.batteryBoxId}', '${description}', '${category}', '${d.severity}', '${d.status}', ${resolution}, ${resolvedById}, ${resolvedAt}, '${createdAt}', '${updatedAt}') ON CONFLICT ("id") DO NOTHING;\n`
      }
      sql += '\n'
    }

    // Write to file
    fs.writeFileSync('prisma/neon-import.sql', sql)
    console.log('\n✅ SQL export saved to prisma/neon-import.sql')
    console.log('Copy the contents of this file and paste into Neon SQL Editor')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

exportData()
