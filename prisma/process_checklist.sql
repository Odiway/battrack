-- Process Kalite Kontrol Checklist Template ve Sorular

-- 1. Checklist Template oluştur
INSERT INTO "checklist_templates" ("id", "name", "description", "active", "createdAt", "updatedAt") 
VALUES ('template_process_kalite', 'Process Kalite Kontrol Formu', 'Batarya kutusu process kalite kontrol checklist', true, NOW(), NOW());

-- 2. MEKANİK KONTROLLER (1-10)
INSERT INTO "checklist_questions" ("id", "checklistTemplateId", "questionText", "questionType", "displayOrder", "required", "createdAt", "updatedAt") VALUES

('q_mek_01', 'template_process_kalite', 'Batarya kutusu boya işlemi sonrası, kılavuz ve pafta çekilmesi gereken tüm deliklerde işlem gerçekleştirilmiş midir? (Kabul: Toplam delik sayısı / işlem yapılan delik sayısı %100)', 'NUMBER', 1, true, NOW(), NOW()),

('q_mek_02', 'template_process_kalite', 'Batarya arka sabitleme mesnedi yüzeyi ile batarya yüzeyi arasında açıklık mevcut mudur? (Kabul: Ölçülen açıklık 0–0,5 mm aralığında)', 'NUMBER', 2, true, NOW(), NOW()),

('q_mek_03', 'template_process_kalite', 'Kaporta mesnedini bataryaya bağlayan civata deliklerinde boya, çapak veya yüzey bozukluğu bulunmakta mıdır? (Kabul: Boya ve çapak bulunmamalıdır)', 'TEXT', 3, true, NOW(), NOW()),

('q_mek_04', 'template_process_kalite', 'Batarya su giriş rekoru bağlantı yüzeyinde, sızdırmazlığı olumsuz etkileyecek çapak veya yüzey kusuru mevcut mudur? (Kabul: O-ring temas yüzeyi %100 pürüzsüz olmalıdır)', 'TEXT', 4, true, NOW(), NOW()),

('q_mek_05', 'template_process_kalite', 'Batarya su giriş rekorunun iç yüzeyinde akış kesitini daraltacak çapak bulunmakta mıdır? (Kabul: İç yüzeyde çapak bulunmamalıdır)', 'TEXT', 5, true, NOW(), NOW()),

('q_mek_06', 'template_process_kalite', 'Batarya su giriş rekoru sabitleme civatası, kaynaklı yüzeye temas edecek şekilde montajlanmış mıdır? (Kabul: Civata kaynak yüzeyine binmemelidir)', 'TEXT', 6, true, NOW(), NOW()),

('q_mek_07', 'template_process_kalite', 'Batarya su giriş rekoru sabitleme civataları teknik resimde belirtilen tork değerleri içerisinde sıkılmış mıdır? (Kabul: Ölçülen tork, nominal değerin ± toleransı içinde olmalıdır)', 'NUMBER', 7, true, NOW(), NOW()),

('q_mek_08', 'template_process_kalite', 'Batarya üzerindeki tüm saplamaların dip bölgelerinde kaynak çapakları temizlenmiş midir? (Kabul: %100 saplamada çapak bulunmamalıdır)', 'TEXT', 8, true, NOW(), NOW()),

('q_mek_09', 'template_process_kalite', 'Saplamalara somun montajı sırasında, somun en az 3 diş elle ilerleyebilmekte midir? (Kabul: Elle ilerleme ≥ 3 diş)', 'NUMBER', 9, true, NOW(), NOW()),

('q_mek_10', 'template_process_kalite', 'Batarya içi montaj öncesinde, vida ile bağlanacak tüm deliklerde kılavuz çekim işlemi tamamlanmış mıdır? (Kabul: Kılavuz çekilmiş delik sayısı / toplam delik sayısı %100)', 'NUMBER', 10, true, NOW(), NOW()),

-- 4. ELEKTRİK & MONTAJ KONTROLLERİ (11-20)
('q_ele_01', 'template_process_kalite', 'Soğutma suyu giriş ve çıkış boru hatlarının montajı, teknik resim ve akış yönüne uygun şekilde tamamlanmış mıdır? (Kabul: Boru hattı eksiksiz, ezilme ve yanlış yönlenme olmamalıdır)', 'TEXT', 11, true, NOW(), NOW()),

('q_ele_02', 'template_process_kalite', 'Batarya modülleri arası soğutma suyu dolaşımını sağlayan boru hattı doğru konumda monte edilmiş midir? (Kabul: Hatlar teknik resme uygun konumda olmalıdır)', 'TEXT', 12, true, NOW(), NOW()),

('q_ele_03', 'template_process_kalite', 'MSD valf ve sızdırmazlık contası, doğru pozisyonda ve eksiksiz olarak monte edilmiş midir? (Kabul: Conta yerinden taşmamış ve hasarsız olmalıdır)', 'TEXT', 13, true, NOW(), NOW()),

('q_ele_04', 'template_process_kalite', 'Amphenol konnektörlerin montajı doğru polariteye uygun şekilde yapılmış mıdır? (Kabul: Artı uç mavi, eksi uç siyah konnektör ile bağlanmış olmalıdır)', 'TEXT', 14, true, NOW(), NOW()),

('q_ele_05', 'template_process_kalite', 'Amphenol konnektörlerin interlock bağlantıları eksiksiz olarak gerçekleştirilmiş midir? (Kabul: Interlock devresi kapalı ve mekanik kilit aktif olmalıdır)', 'TEXT', 15, true, NOW(), NOW()),

('q_ele_06', 'template_process_kalite', 'Batarya basınç valfi, yön bilgisi dikkate alınarak doğru şekilde monte edilmiş midir? (Kabul: Valf yön oku teknik dokümana uygun olmalıdır)', 'TEXT', 16, true, NOW(), NOW()),

('q_ele_07', 'template_process_kalite', 'Artı ve eksi kontaktörlerin montajı, yön ve bağlantı şemasına uygun olarak yapılmış mıdır? (Kabul: Ters bağlantı veya eksik bağlantı bulunmamalıdır)', 'TEXT', 17, true, NOW(), NOW()),

('q_ele_08', 'template_process_kalite', 'BCU montajı ve mekanik sabitlemesi tamamlanmış mıdır? (Kabul: Tüm sabitleme vidaları mevcut ve belirtilen tork aralığında olmalıdır)', 'NUMBER', 18, true, NOW(), NOW()),

('q_ele_09', 'template_process_kalite', 'BCU tesisat bağlantıları eksiksiz ve kilitli şekilde yapılmış mıdır? (Kabul: Açıkta veya kilitsiz konnektör bulunmamalıdır)', 'TEXT', 19, true, NOW(), NOW()),

('q_ele_10', 'template_process_kalite', 'Preşarj kontrol kartı ve kontaktör montajı tamamlanmış mıdır? (Kabul: Kart ve kontaktör mekanik olarak sabitlenmiş olmalıdır)', 'TEXT', 20, true, NOW(), NOW()),

-- 5. TEST & FİNAL KONTROLLER (21-30)
('q_test_01', 'template_process_kalite', 'Batarya modülleri, batarya kutusu içerisine teknik dokümanda belirtilen tork değerleri ile sabitlenmiş midir? (Kabul: Ölçülen tork değerleri nominal ± tolerans aralığında olmalıdır)', 'NUMBER', 21, true, NOW(), NOW()),

('q_test_02', 'template_process_kalite', 'Modüller arası bara bağlantıları eksiksiz olarak yapılmış mıdır? (Kabul: Açık veya eksik bara bağlantısı bulunmamalıdır)', 'TEXT', 22, true, NOW(), NOW()),

('q_test_03', 'template_process_kalite', 'Bara ile batarya gövdesi arasında izolasyon ölçümü gerçekleştirilmiş midir? (Kabul: Ölçülen izolasyon direnci ≥ 100 MΩ)', 'NUMBER', 23, true, NOW(), NOW()),

('q_test_04', 'template_process_kalite', 'Batarya (+) – GND ve Batarya (–) – GND arası voltaj ölçümü yapılmış mıdır? (Kabul: Ölçülen değer 0 V ± tolerans aralığında olmalıdır)', 'NUMBER', 24, true, NOW(), NOW()),

('q_test_05', 'template_process_kalite', 'Montaj bitiminde 1,5 bar basınç ile hava testi uygulanmış mıdır? (Kabul: ≥10 dakika sonunda basınç düşümü ≤0,1 bar)', 'NUMBER', 25, true, NOW(), NOW()),

('q_test_06', 'template_process_kalite', '2 bar basınç testi gerçekleştirilmiş midir? (Kabul: Görsel veya ölçümsel kaçak bulunmamalıdır)', 'TEXT', 26, true, NOW(), NOW()),

('q_test_07', 'template_process_kalite', 'Preşarj fonksiyonu ve kontaktör açma/kapama davranışı doğrulanmış mıdır? (Kabul: Fonksiyonlar test planına uygun çalışmalıdır)', 'TEXT', 27, true, NOW(), NOW()),

('q_test_08', 'template_process_kalite', 'Sevk öncesi batarya SOC değeri doğrulanmış mıdır? (Kabul: SOC değeri sevk planında belirtilen aralıkta olmalıdır)', 'NUMBER', 28, true, NOW(), NOW()),

('q_test_09', 'template_process_kalite', 'Final hata kodu / DTC ekran kontrolü gerçekleştirilmiş midir? (Kabul: Aktif hata kodu bulunmamalıdır)', 'TEXT', 29, true, NOW(), NOW()),

('q_test_10', 'template_process_kalite', 'Cycle test uygulanmış ve test raporu dokümantasyona eklenmiş midir? (Kabul: Test planındaki cycle sayısı tamamlanmış ve rapor mevcut olmalıdır)', 'NUMBER', 30, true, NOW(), NOW());