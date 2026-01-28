const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// WebSocket için Node.js ortamında gerekli
neonConfig.webSocketConstructor = ws;

const connectionString = 'postgresql://neondb_owner:npg_6YIVCOflSw3r@ep-nameless-rice-ahy8t6iu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });

async function testConnection() {
  try {
    console.log('Neon veritabanına bağlanılıyor...');
    
    // User sayısını kontrol et
    const userResult = await pool.query('SELECT COUNT(*) as count FROM "users"');
    console.log('✅ Bağlantı başarılı!');
    console.log('User sayısı:', userResult.rows[0].count);
    
    // Process sayısını kontrol et
    const processResult = await pool.query('SELECT COUNT(*) as count FROM "processes"');
    console.log('Process sayısı:', processResult.rows[0].count);
    
    // Kullanıcıları listele
    const users = await pool.query('SELECT email, name, role FROM "users"');
    console.log('\nKullanıcılar:');
    users.rows.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
