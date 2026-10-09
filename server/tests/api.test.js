import assert from 'node:assert';
import http from 'node:http';

const testApiEndpoints = async () => {
  console.log('🧪 Running live API tests without mock data...');

  const getJson = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:5000${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }).on('error', reject);
    });
  };

  try {
    // 1. Health check
    const health = await getJson('/api/health');
    assert.strictEqual(health.status, 200);
    console.log('✅ PASS: /api/health');

    // 2. Real OpenStreetMap Places
    const places = await getJson('/api/places?city=Pune');
    assert.strictEqual(places.status, 200);
    console.log(`✅ PASS: /api/places (fetched ${places.data.count} real OSM places)`);

    // 3. Open-Meteo Weather
    const weather = await getJson('/api/weather?city=Pune');
    assert.strictEqual(weather.status, 200);
    assert.ok(weather.data.current.temperature !== undefined);
    console.log(`✅ PASS: /api/weather (Current Live Temp: ${weather.data.current.temperature}°C)`);

    // 4. Reports API
    const reports = await getJson('/api/reports');
    assert.strictEqual(reports.status, 200);
    console.log(`✅ PASS: /api/reports (clean reports queue)`);

    console.log('\n🎉 ALL LIVE TESTS PASSED (0 Mock Data)!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
};

testApiEndpoints();
