// Rychlý diagnostický skript pro kontrolu API endpointu
// Spusťte: node check-api.js

const https = require('https');
const http = require('http');

// Získejte URL z argumentu nebo použijte default
const url = process.argv[2] || 'https://cxtechrack.vercel.app/api/config';

console.log('🔍 Kontroluji API endpoint:', url);
console.log('');

const client = url.startsWith('https') ? https : http;

const req = client.get(url, (res) => {
  let data = '';

  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Response JSON:');
      console.log(JSON.stringify(json, null, 2));
      console.log('');

      // Zkontrolujte, zda všechny hodnoty jsou vyplněné
      const missing = Object.entries(json)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missing.length > 0) {
        console.log('❌ Chybí hodnoty:', missing);
        console.log('');
        console.log('🔧 ŘEŠENÍ:');
        console.log('1. Vercel Dashboard → Project → Settings → Environment Variables');
        console.log('2. Přidejte chybějící proměnné s prefixem NEXT_PUBLIC_');
        console.log('3. Redeploy aplikace');
      } else {
        console.log('✅ Všechny hodnoty jsou vyplněné!');
      }
    } catch (e) {
      console.log('Response (ne JSON):');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Chyba:', error.message);
  console.log('');
  console.log('Možné příčiny:');
  console.log('- URL není správná');
  console.log('- API endpoint neexistuje');
  console.log('- Problém s připojením');
});

req.end();




