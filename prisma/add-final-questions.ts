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
  "Batarya paketi üzerinde çizik, darbe, çatlak, boya atığı var mı?",
  "Paket üzerinde yabancı madde, kir, yağ, nem var mı?",
  "Batarya araç montaj için kullanılan delikler uygun ölçüde açılmış mı?",
  "Batarya modülleri kutu içi sabitleme yerleri uygun ölçülerde montajlanmış mı?",
  "Batarya içi BCU montajı için kullanılan distanlar uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya içi filtre kartı montajı için kullanılan distanlar uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya içi kontaktör montajı için kullanılan distanlar uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya içi gaz sensörü montajı için kullanılan distanlar uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Bataryanın üst kapağı kapak vida perçimleri uygun mu?",
  "Batarya MSD mekanik güç kesici montajı için kullanılan perçimler uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya + ve - konnektör montajı için kullanılan perçimler uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya harting soketi montajı için kullanılan perçimler uygun ölçüde ve uygun bölgede montajlanmış mı?",
  "Batarya içi basınç ventil montajı yeri uygun ölçüde açılmış mı?",
  "Batarya içi soğutma paneli dış su bağlantı delikleri ve montaj civata delikleri yeri uygun ölçüde açılmış mı?",
  "Firma tarafından batarya soğutma karkası montajı için gönderilmesi gereken M8 alyan civatalar gönderilmiş mi?",
  "Firma tarafından kapak montajı için gönderilmesi gereken M6 alyan civatalar gönderilmiş mi?",
  "Soğutma paneli kutu içine montajda vida delik ölçüleri karşılıyor mu?",
  "Soğutma paneli batarya montaj karkasına uygun şekilde montajlanıyor mu?",
  "Batarya BMU montaj karkası kart montaj distansı uygun ölçüde montajlanmış mı?",
  "Hücre sıcaklık sensörleri doğru konumda ve sağlam mı?",
  "İzolasyon malzemeleri eksiksiz mi?",
  "Etiketler (seri no, üretim tarihi, uyarılar) eksiksiz ve okunabilir mi?",
  "Batarya sens iletişim tesisatı LG ve BMU tarafı uygun fişlenmiş mi?",
  "Batarya sens iletişim tesisatı LG ve BMU tarafı uygun soket kullanılmış mı?",
  "Batarya sens iletişim tesisatı LG ve BMU tarafı terminal pinlemeleri doğru yapılmış mı?",
  "Batarya BMU arası iletişim tesisat uzunluk ölçüleri uygun mu?",
  "Batarya BMU arası iletişim tesisat soketleri uygun mu?",
  "Batarya BMU arası iletişim tesisat terminal pinlemeleri doğru yapılmış mı?",
  "Batarya BCU tesisatı uygun fişlenmiş mi?",
  "Batarya BCU tesisatı uygun soket kullanılmış mı?",
  "Batarya BCU tesisatı ile birlikte gelmesi gereken soketler gelmiş mi?",
  "Kablo güzergahları doğru, sabitlemeler sağlam mı?",
  "Kablo etiketlemeleri doğru ve okunabilir mi?",
  "Kablo koruma elemanları (spiral, koruyucu kılıf) eksiksiz mi?",
  "Kablo uçlarında gevşeklik, oksitlenme, deformasyon var mı?",
  "Batarya içi montaj baraları uygun ölçüde gelmiş mi?",
  "Batarya içi bara tutucu derlinkleri uygun ölçüde gelmiş mi?",
  "Bara bağlantıları doğru torkta sıkılmış mı?",
  "Batarya içi soğutma su dağıtıcısında hasar ve çapak var mı?",
  "Batarya içi gaz sensörü montaj klipsi gelmiş mi?",
  "Batarya içi gaz sensörü montaj L braket ölçüleri uygun mu?",
  "Modül izolasyon direnci ölçümü uygun mu?",
  "Hücre voltaj dengesi (cell balancing) kontrol edildi mi?",
  "Toplam paket voltajı nominal değerde mi? - KRİTİK",
  "BMS fonksiyonları (şarj, deşarj, koruma) çalışıyor mu? - KRİTİK",
  "Yazılım versiyonu ve parametreler doğrulandı mı? - KRİTİK",
  "Paket dış kasası ve taşıma aparatları sağlam mı?",
  "Nakliye etiketleri ve müşteri etiketleri eksiksiz mi?",
  "Paket sevkiyata hazır pozisyonda mı (örneğin: HV konnektör kapalı, emniyet pimi takılı)?",
  "Son kontrol formu imzalanmış ve arşivlenmiş mi?"
]

async function main() {
  // Find or create "Final Kalite Kontrol" checklist template
  let template = await prisma.checklistTemplate.findFirst({
    where: {
      name: {
        contains: 'Final Kalite'
      }
    },
    include: {
      questions: true
    }
  })

  if (!template) {
    console.log('Final Kalite checklist not found, creating new one...')
    template = await prisma.checklistTemplate.create({
      data: {
        name: 'Final Kalite Kontrol',
        description: 'Batarya paketi final kalite kontrol ve sevkiyat öncesi kontrol listesi',
        questions: {
          create: questions.map((q, index) => ({
            questionText: q,
            questionType: 'YES_NO',
            required: true,
            displayOrder: index + 1
          }))
        }
      },
      include: {
        questions: true
      }
    })
    console.log(`Created new template "${template.name}" with ${questions.length} questions`)
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
