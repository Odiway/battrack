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
  "Soğutma paneli ana su hattı giriş boruları montajı yapılmış mı?",
  "Batarya kutusu batarya ve soğutma paneli montaj yerleri vida ve klavuz ile kontrolü yapılmış mı?",
  "Soğutma paneline batarya blok montaj karkası montajı yapılmış mı?",
  "BMU kart montajı yapılacak braket üzeri M3 vida yerleri klavuz işlemi yapılmış mı?",
  "Batarya kutu içi izolasyon malzemesi montajı yapılmış mı?",
  "BCU montajı yapılmış mı?",
  "MSD valf ve sızdırmazlık contası montajı yapılmış mı?",
  "Filtre kart montajı yapılmış mı?",
  "Anfemon konnektör montajı yapılmış mı? (artı uç için mavi, eksi uç için siyah konnektör)",
  "Sigorta kaidesi ve sigorta montajı yapılmış mı?",
  "BCU tesisat montajı yapılmış mı?",
  "Anfemon konnektör interlock bağlantısı yapılmış mı?",
  "Akım sensörü montajı yapılmış mı?",
  "Artı ve Eksi kontaktör montajı yapılmış mı?",
  "Soğutma paneli birinci kat üzeri ısı transfer için kullanılan termal pet montajı yapılmış mı?",
  "Soğutma paneli birinci kat montajı ve hortum montajı yapılmış mı?",
  "Soğutma paneli ikinci kat üzeri ısı transfer için kullanılan termal pet montajı yapılmış mı?",
  "Soğutma paneli ikinci kat montajı ve hortum montajı yapılmış mı?",
  "Soğutma paneli üçüncü kat üzeri ısı transfer için kullanılan termal pet montajı yapılmış mı?",
  "Soğutma paneli üçüncü kat montajı ve hortum montajı yapılmış mı?",
  "BMU montaj braketi M3 vida klavuzu yapılmış mı?",
  "Bara montajı yapılmış mı?",
  "Batarya basınç valfi montajı yapılmış mı?",
  "BMU montaj braketi sabitlenmiş mi?",
  "BMU kart montajı yapılmış mı?",
  "Kapak contası montajı yapılmış mı?",
  "Kapak civataları torklanmış mı?",
  "LG batarya (sens) iletişim tesisatı yapılmış mı?",
  "BMU ve Batarya arası tesisat soketleri takılmış mı?",
  "BMU arası iletişim tesisatı montajı yapılmış mı?",
  "BMU üzeri SW2 on yapılmış mı?",
  "Gaz sensörü montajı yapılmış mı?",
  "Nem sensörü montajı yapılmış mı?",
  "LG batarya 12 cell ve sıcaklık sensör bilgileri kontrol edilmiş mi?",
  "LG batarya QR ve cell voltajları kaydedilmiş mi?",
  "Ölçümleri yapılan 15. 14. 13. 12. ve 11. LG batarya blok montajı ve sabitleme civatalarının montajı yapılmış mı?",
  "Ölçümleri yapılan 10. 9. 8. 7. ve 6. LG batarya blok montajı ve sabitleme civatalarının montajı yapılmış mı?",
  "Ölçümleri yapılan 5. 4. 3. 2. ve 1. LG batarya blok montajı ve sabitleme civatalarının montajı yapılmış mı?",
  "Bara tutucu derlin montajı yapılmış mı? (4 adet) - Kat 1",
  "Bara tutucu derlin montajı yapılmış mı? (4 adet) - Kat 2",
  "Bara tutucu derlin montajı yapılmış mı? (4 adet) - Kat 3",
  "Montajı yapılan batarya grubu ara bara montajı yapılmış mı? - Kat 1",
  "Montajı yapılan batarya grubu ara bara montajı yapılmış mı? - Kat 2",
  "Montajı yapılan batarya grubu ara bara montajı yapılmış mı? - Kat 3",
  "Artı bara sıcaklık sensör montajı yapılmış mı?",
  "Eksi bara üzeri sıcaklık sensör montajı yapılmış mı?",
  "Batarya (+) & GND ve Batarya (-) & GND arası voltaj ölçümü yapılmış mı?",
  "Su soğutma panellerin hava ile (1,5 bar) basınç testi yapılmış mı?",
  "Batarya CYCLE testleri (10 cycle şeklinde (738 volt-200 amper charge)-(620 volt 200 amper discharge)) tamamlanmış mı?",
  "Batarya üzeri tanıtım etiketi ve diğer etiketler yapıştırılmış mı?",
  "Montajı yapılan batarya ve kartların etiket bilgileri yazılmış mı?",
  "BCU/BMU yazılım-sürüm konfigürasyonu plana uygun mu?",
  "Yükleme sonrası test yazılımı uygun mu?",
  "Kontaktör aç/kapa ve preşarj eğrisi doğrulandı mı?",
  "2 Bar altında Basınç Testi yapıldı mı?",
  "Sevk SOC doğrulandı mı?",
  "Hata kodu/DTM ekran kontrolü (final) yapıldı mı?",
  "Cycle Test yapıldı mı? Test Raporu eklendi mi?"
]

async function main() {
  // Find the checklist template - specifically "Process Kalite Kontrol Uygulaması"
  const template = await prisma.checklistTemplate.findFirst({
    where: {
      name: {
        contains: 'Process Kalite'
      }
    },
    include: {
      questions: true
    }
  })

  if (!template) {
    console.log('Checklist template not found, creating new one...')
    
    const newTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Process Kalite Kontrol Uygulaması',
        description: 'Batarya kutusu üretim kalite kontrol checklist',
        questions: {
          create: questions.map((q, index) => ({
            questionText: q,
            questionType: 'YES_NO',
            required: true,
            displayOrder: index + 1
          }))
        }
      }
    })
    
    console.log(`Created new template with ${questions.length} questions`)
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
