import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ 
  connectionString: 'postgresql://postgres:postgres@localhost:51214/postgres',
  max: 1
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const questions = [
  "Elektriksel bağlantı yüzeyleri temiz ve oksitsiz mi?",
  "Modül dış yüzeyinde deformasyon/çatlak var mı?",
  "Kısa devre önleyici korumalar (kapak/izolasyon) eksiksiz mi?",
  "Modül üzerinde FOD/partikül var mı?",
  "Ambalaj/taşıma zararına dair iz var mı?",
  "Modül sabitleme delikleri ölçü ve konumda mı?",
  "Modül ağırlığı nominal aralıkta mı?",
  "Modül etiketi (PN/SN/lot) okunaklı ve doğru mu?",
  "Seri numarası barkodu okunuyor mu?",
  "OCV değerleri nominal aralıkta mı?",
  "Balans durumu ve eşleştirme kriterleri sağlanmış mı?",
  "İç direnç (IR) değerleri limitler içinde mi?",
  "Kaplama türü ve kalınlığı (Ni/Ag) uygun mu?",
  "Boyutlar/delikler resme uygun mu?",
  "Düzlemsellik ve sehim tolerans içinde mi?",
  "Kenarlar çapaksız ve radius/pah uygun mu?",
  "Delik merkezleri karşılıklı hizalı mı?",
  "Delik yüzeyinde çatlak/ezilme var mı?",
  "Oksit/kir/yağ kalıntısı var mı?",
  "Kaplama soyulması/kabarcık var mı?",
  "Delik çap toleransları pime/civataya uygun mu?",
  "Slot genişliği ve kenarları resme uygun mu?",
  "Büküm bölgelerinde mikro çatlak/grişme var mı?",
  "İzolasyon kaplama sonlandırması düzgün mü?",
  "Yüzeyde renk farkı/lekelenme kabul sınırında mı?"
]

async function main() {
  // Find the "Giriş Kalite Kontrolü ve Stok Uygulaması" checklist template
  const template = await prisma.checklistTemplate.findFirst({
    where: {
      name: {
        contains: 'Giriş Kalite'
      }
    },
    include: {
      questions: true
    }
  })

  if (!template) {
    console.log('Giriş Kalite checklist template not found!')
    return
  }

  console.log(`Found template: ${template.name} with ${template.questions.length} existing questions`)
  
  // Delete existing questions
  await prisma.checklistQuestion.deleteMany({
    where: {
      checklistTemplateId: template.id
    }
  })
  
  console.log('Deleted existing questions')

  // Add new questions
  for (let i = 0; i < questions.length; i++) {
    await prisma.checklistQuestion.create({
      data: {
        checklistTemplateId: template.id,
        questionText: questions[i],
        questionType: 'YES_NO',
        required: true,
        displayOrder: i + 1
      }
    })
  }

  console.log(`Added ${questions.length} questions to the checklist template`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
    process.exit(0)
  })
