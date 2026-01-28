-- Export from local database - CLEAN DATA
-- Generated at 2026-01-28

-- Users
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") VALUES ('cmkv363290000v4o8os8jtpzb', 'admin@factory.com', '$2b$10$ELu8gcneJ6GMOqW20Otft.JH5nihLr8jttAnFcQq5sZ6zTSk3tXke', 'Admin User', 'ADMIN', '2026-01-26T11:30:31.019Z', '2026-01-26T11:30:31.019Z') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") VALUES ('cmkv363630002v4o8ei4u6lj9', 'quality@factory.com', '$2b$10$LMou8hl7OymQULfP.pajFO7LgJ3jPHu4.owYJ1QHQHHnl3kuFcjhy', 'Quality Inspector', 'QUALITY', '2026-01-26T11:30:31.177Z', '2026-01-26T11:30:31.177Z') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt") VALUES ('cmkv3634a0001v4o8aipdb40r', 'operator@factory.com', '$2b$10$TmETRTxyoU/KeIyvfRS/nOI/MHmHDPCk4MIKf5JJ5dqkyU6sowxHK', 'Operator', 'OPERATOR', '2026-01-26T11:30:31.112Z', '2026-01-26T11:41:46.087Z') ON CONFLICT ("id") DO NOTHING;

-- Processes (Turkish quality processes)
INSERT INTO "Process" ("id", "name", "description", "orderIndex", "createdAt", "updatedAt") VALUES ('cmkwao7xt0010k4o8dntc96el', 'Giriş Kalite Kontrolü ve Stok Uygulaması', 'Gelen Malzemelerin doğrulunu ve adetlerini kontrol ettiğimiz sürecin başlangıcıdır.', 1, '2026-01-27T07:48:20.657Z', '2026-01-27T07:48:20.657Z') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Process" ("id", "name", "description", "orderIndex", "createdAt", "updatedAt") VALUES ('cmkwbwtlc00013so8rpp6ej7m', 'Process Kalite Kontrol Uygulaması', 'Montaj işlemlerinin kontrol edildiği giriş kalite tamamlandıktan sonra yapılan uygulamadır.', 2, '2026-01-27T08:23:01.584Z', '2026-01-27T08:24:57.361Z') ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Process" ("id", "name", "description", "orderIndex", "createdAt", "updatedAt") VALUES ('cmkwbxpvn00023so81mahow6s', 'Final Kalite Kontrolü ve Sevk Uygulaması', 'Final Kalite Kontrolü ve Sevk Uygulamasının Kontrol edildiği uygulamadır.', 3, '2026-01-27T08:23:43.427Z', '2026-01-27T08:23:43.427Z') ON CONFLICT ("id") DO NOTHING;
