import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

// For seeding, use direct TCP connection via pg adapter
const pool = new pg.Pool({
  connectionString: 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@factory.com' },
    update: {},
    create: {
      email: 'admin@factory.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✓ Created admin user:', admin.email)

  // Create operator user
  const operatorPassword = await bcrypt.hash('operator123', 10)
  const operator = await prisma.user.upsert({
    where: { email: 'operator@factory.com' },
    update: {},
    create: {
      email: 'operator@factory.com',
      name: 'John Operator',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  })
  console.log('✓ Created operator user:', operator.email)

  // Create quality user
  const qualityPassword = await bcrypt.hash('quality123', 10)
  const quality = await prisma.user.upsert({
    where: { email: 'quality@factory.com' },
    update: {},
    create: {
      email: 'quality@factory.com',
      name: 'Quality Inspector',
      password: qualityPassword,
      role: 'QUALITY',
    },
  })
  console.log('✓ Created quality user:', quality.email)

  // Create manufacturing processes
  const processes = [
    { name: 'Mechanical Assembly', description: 'Assemble mechanical components', checklistRequired: true, displayOrder: 1 },
    { name: 'Welding', description: 'Weld battery box frame', checklistRequired: true, displayOrder: 2 },
    { name: 'HV Test', description: 'High voltage isolation test', checklistRequired: true, displayOrder: 3 },
    { name: 'Quality Inspection', description: 'Final quality inspection', checklistRequired: true, displayOrder: 4 },
    { name: 'Packaging', description: 'Pack for shipping', checklistRequired: false, displayOrder: 5 },
  ]

  for (const p of processes) {
    await prisma.process.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    })
  }
  console.log('✓ Created', processes.length, 'processes')

  // Create checklist templates
  const mechanicalChecklist = await prisma.checklistTemplate.upsert({
    where: { name: 'Mechanical Assembly Checklist' },
    update: {},
    create: {
      name: 'Mechanical Assembly Checklist',
      description: 'Standard checklist for mechanical assembly',
      questions: {
        create: [
          { questionText: 'All bolts torqued to specification?', questionType: 'YES_NO', displayOrder: 1 },
          { questionText: 'Gaskets properly seated?', questionType: 'YES_NO', displayOrder: 2 },
          { questionText: 'Connectors properly aligned?', questionType: 'YES_NO', displayOrder: 3 },
          { questionText: 'Visual inspection passed?', questionType: 'YES_NO', displayOrder: 4 },
          { questionText: 'Notes/observations', questionType: 'TEXT', required: false, displayOrder: 5 },
        ],
      },
    },
  })
  console.log('✓ Created mechanical assembly checklist')

  const weldingChecklist = await prisma.checklistTemplate.upsert({
    where: { name: 'Welding Inspection Checklist' },
    update: {},
    create: {
      name: 'Welding Inspection Checklist',
      description: 'Welding quality checklist',
      questions: {
        create: [
          { questionText: 'Weld bead consistent?', questionType: 'YES_NO', displayOrder: 1 },
          { questionText: 'No visible cracks or porosity?', questionType: 'YES_NO', displayOrder: 2 },
          { questionText: 'Penetration depth adequate?', questionType: 'YES_NO', displayOrder: 3 },
          { questionText: 'Surface finish acceptable?', questionType: 'YES_NO', displayOrder: 4 },
        ],
      },
    },
  })
  console.log('✓ Created welding checklist')

  const hvTestChecklist = await prisma.checklistTemplate.upsert({
    where: { name: 'HV Test Checklist' },
    update: {},
    create: {
      name: 'HV Test Checklist',
      description: 'High voltage test procedure',
      questions: {
        create: [
          { questionText: 'Test equipment calibrated?', questionType: 'YES_NO', displayOrder: 1 },
          { questionText: 'Safety barriers in place?', questionType: 'YES_NO', displayOrder: 2 },
          { questionText: 'Insulation resistance (MΩ)', questionType: 'NUMBER', displayOrder: 3 },
          { questionText: 'HV test passed at 1500V?', questionType: 'YES_NO', displayOrder: 4 },
          { questionText: 'No arcing observed?', questionType: 'YES_NO', displayOrder: 5 },
        ],
      },
    },
  })
  console.log('✓ Created HV test checklist')

  const qualityChecklist = await prisma.checklistTemplate.upsert({
    where: { name: 'Final Quality Inspection' },
    update: {},
    create: {
      name: 'Final Quality Inspection',
      description: 'Final quality check before shipping',
      questions: {
        create: [
          { questionText: 'Serial number label applied?', questionType: 'YES_NO', displayOrder: 1 },
          { questionText: 'All documentation complete?', questionType: 'YES_NO', displayOrder: 2 },
          { questionText: 'External visual inspection passed?', questionType: 'YES_NO', displayOrder: 3 },
          { questionText: 'Weight within specification?', questionType: 'YES_NO', displayOrder: 4 },
          { questionText: 'Final approval granted?', questionType: 'YES_NO', displayOrder: 5 },
        ],
      },
    },
  })
  console.log('✓ Created final quality checklist')

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Login credentials:')
  console.log('  Admin: admin@factory.com / admin123')
  console.log('  Operator: operator@factory.com / operator123')
  console.log('  Quality: quality@factory.com / quality123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
