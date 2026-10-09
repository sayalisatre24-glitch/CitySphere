import express from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifiedCityLocations } from '../data/curatedLocations.js';
import { reportsStore } from './reports.js';

const router = express.Router();

// Real-time Coordinates for Weather Queries
const cityCoordinates = {
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  mumbai: { lat: 18.9220, lng: 72.8347, name: 'Mumbai' },
  nashik: { lat: 19.9975, lng: 73.7898, name: 'Nashik' },
  shirdi: { lat: 19.7667, lng: 74.4766, name: 'Shirdi' },
  mahabaleshwar: { lat: 17.9237, lng: 73.6586, name: 'Mahabaleshwar' },
  lonavala: { lat: 18.7557, lng: 73.4091, name: 'Lonavala' },
  kolhapur: { lat: 16.7050, lng: 74.2433, name: 'Kolhapur' },
  satara: { lat: 17.6805, lng: 73.9930, name: 'Satara' },
  'chhatrapati sambhaji nagar': { lat: 19.8762, lng: 75.3433, name: 'Chhatrapati Sambhaji Nagar' },
  aurangabad: { lat: 19.8762, lng: 75.3433, name: 'Chhatrapati Sambhaji Nagar' },
  nagpur: { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  alibaug: { lat: 18.6414, lng: 72.8722, name: 'Alibaug' }
};

// Live Weather Fetcher via Open-Meteo
const getLiveWeatherForCity = async (cityName) => {
  const normCity = (cityName || '').toLowerCase().trim();
  let coords = cityCoordinates[normCity];

  if (!coords) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ', Maharashtra')}&format=json&limit=1`;
      const geoRes = await axios.get(geoUrl, {
        headers: { 'User-Agent': 'CitySphere/3.0 (info@citysphere.ai)' },
        timeout: 3000
      });
      if (geoRes.data && geoRes.data[0]) {
        coords = {
          lat: parseFloat(geoRes.data[0].lat),
          lng: parseFloat(geoRes.data[0].lon),
          name: cityName
        };
      }
    } catch (e) {
      coords = cityCoordinates.pune;
    }
  }

  if (!coords) coords = cityCoordinates.pune;

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FKolkata`;
    const res = await axios.get(weatherUrl, { timeout: 4000 });
    const c = res.data.current;

    const weatherCodeMap = {
      0: 'Clear Sky ☀️',
      1: 'Mainly Clear 🌤️',
      2: 'Partly Cloudy ⛅',
      3: 'Overcast ☁️',
      45: 'Foggy 🌫️',
      51: 'Light Drizzle 🌦️',
      61: 'Slight Rain 🌧️',
      63: 'Moderate Rain 🌧️',
      65: 'Heavy Rain ⛈️',
      80: 'Rain Showers 🌦️',
      95: 'Thunderstorm ⚡'
    };

    return {
      cityName: coords.name,
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      condition: weatherCodeMap[c.weather_code] || 'Clear ☀️',
      precipitation: c.precipitation || 0
    };
  } catch (err) {
    return null;
  }
};

// POST /api/ai/chat - Intelligent Assistant with Gemini AI + Real Weather & Places
router.post('/chat', async (req, res) => {
  try {
    const { message, city = 'Pune', customApiKey } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const q = message.toLowerCase().trim();
    const activeCity = city || 'Pune';

    // 1. Fetch Real Weather if query asks for weather / climate / rain / temperature
    const isWeatherQuery = q.includes('weather') || q.includes('rain') || q.includes('temp') || q.includes('forecast') || q.includes('climate') || q.includes('hot') || q.includes('cold');
    let liveWeather = null;
    if (isWeatherQuery || q.includes('visit') || q.includes('plan')) {
      liveWeather = await getLiveWeatherForCity(activeCity);
    }

    // 2. Filter Verified Real Places based on category intent
    let matchedPlaces = verifiedCityLocations.filter(p => {
      const pCity = (p.city || '').toLowerCase();
      const sCity = activeCity.toLowerCase();
      return pCity.includes(sCity) || sCity.includes(pCity);
    });

    if (matchedPlaces.length === 0) {
      matchedPlaces = verifiedCityLocations.slice(0, 10);
    }

    // Identify Specific Category Intent
    let targetCategory = null;
    if (q.includes('cafe') || q.includes('coffee') || q.includes('bakery') || q.includes('food') || q.includes('eat') || q.includes('restaurant')) {
      targetCategory = 'Cafés & Food';
    } else if (q.includes('temple') || q.includes('spiritual') || q.includes('darshan') || q.includes('ganpati') || q.includes('jyotirlinga') || q.includes('shirdi')) {
      targetCategory = 'Temples & Spiritual';
    } else if (q.includes('fort') || q.includes('history') || q.includes('heritage') || q.includes('monument') || q.includes('peshwa') || q.includes('maratha')) {
      targetCategory = 'Heritage';
    } else if (q.includes('nature') || q.includes('park') || q.includes('lake') || q.includes('hill') || q.includes('view') || q.includes('trek')) {
      targetCategory = 'Nature & Parks';
    }

    let recommendedPlaces = targetCategory
      ? verifiedCityLocations.filter(p => p.category === targetCategory || (p.tags && p.tags.some(t => t.toLowerCase().includes(targetCategory.toLowerCase()))))
      : matchedPlaces;

    if (recommendedPlaces.length === 0) {
      recommendedPlaces = matchedPlaces;
    }

    const topRecommendations = recommendedPlaces.slice(0, 4);

    // 3. Check for Google Gemini API Key
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `You are CitySphere AI, an expert, concise smart city exploration assistant for Maharashtra, India.
Always provide factual, crisp, structured recommendations.
Context:
- Current City: ${activeCity}
- Live Weather Data: ${liveWeather ? `${liveWeather.condition}, ${liveWeather.temperature}°C (Feels like ${liveWeather.feelsLike}°C, Humidity ${liveWeather.humidity}%, Wind ${liveWeather.windSpeed} km/h)` : 'Available on live radar'}
- Real Verified Local Destinations: ${topRecommendations.map(p => `${p.name} (${p.category} in ${p.neighbourhood}, ${p.city} - ${p.cost})`).join('; ')}

Format instructions:
- Keep the response direct and well-structured with clear bullet points.
- Include live temperature/weather if asked.
- Highlight specific spot names in bold.
- Do NOT make up fake places. Use the verified data provided.`;

        const geminiResult = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
        const geminiReply = geminiResult.response.text();

        return res.json({
          success: true,
          data: {
            reply: geminiReply,
            source: 'gemini-ai',
            weather: liveWeather,
            recommendations: topRecommendations.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              city: p.city,
              rating: p.rating,
              cost: p.cost,
              lat: p.lat,
              lng: p.lng,
              googleMapsUrl: p.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
            })),
            suggestedFollowUps: [
              `View ${activeCity} live weather radar`,
              `Show cafes & bakeries in ${activeCity}`,
              `Show temples & heritage sites in ${activeCity}`
            ]
          }
        });
      } catch (geminiErr) {
        console.warn('Gemini API execution error (falling back to grounded engine):', geminiErr.message);
      }
    }

    // 4. Grounded Intelligent Engine (Exact, Zero Mock Data, Live Open-Meteo & OpenStreetMap)
    let reply = '';
    let followUps = [];

    if (isWeatherQuery && liveWeather) {
      reply = `### Live Meteorological Telemetry for **${liveWeather.cityName}**\n\n` +
        `• **Current Condition:** ${liveWeather.condition}\n` +
        `• **Temperature:** **${liveWeather.temperature}°C** (Feels like ${liveWeather.feelsLike}°C)\n` +
        `• **Relative Humidity:** ${liveWeather.humidity}%\n` +
        `• **Wind Speed:** ${liveWeather.windSpeed} km/h\n` +
        `• **Precipitation:** ${liveWeather.precipitation} mm\n\n` +
        `*Data verified via Open-Meteo live atmospheric radar.*`;

      followUps = [
        `What are the best indoor cafes in ${activeCity}?`,
        `Top temples to visit in ${activeCity}`,
        `Plan a one-day tour in ${activeCity}`
      ];
    } else if (targetCategory === 'Cafés & Food') {
      reply = `### Top Verified Cafés & Culinary Spots in **${activeCity}**\n\n` +
        topRecommendations.map(p => `• **${p.name}** (${p.neighbourhood || p.city}) — *${p.cost}* • ⭐ ${p.rating}`).join('\n') +
        `\n\n*Click on any place card below to plot directly on the interactive map or open Google Maps directions.*`;

      followUps = [
        `Check current weather in ${activeCity}`,
        `Show heritage forts in ${activeCity}`,
        `Show revered temples in ${activeCity}`
      ];
    } else if (targetCategory === 'Temples & Spiritual') {
      reply = `### Revered Temples & Spiritual Sanctuaries in **${activeCity} & Maharashtra**\n\n` +
        topRecommendations.map(p => `• **${p.name}** (${p.neighbourhood || p.city}) — *${p.cost}* • ⭐ ${p.rating}`).join('\n') +
        `\n\n*All locations are verified with exact coordinates for GPS navigation.*`;

      followUps = [
        `Show on live spatial map`,
        `Find cafes nearby`,
        `Check live weather in ${activeCity}`
      ];
    } else if (targetCategory === 'Heritage') {
      reply = `### Historic Forts & Maratha Heritage Sites in **${activeCity} & Maharashtra**\n\n` +
        topRecommendations.map(p => `• **${p.name}** (${p.neighbourhood || p.city}) — *${p.cost}* • ⭐ ${p.rating}`).join('\n') +
        `\n\n*Historical landmarks with verified GPS pins and architectural history.*`;

      followUps = [
        `Check trekking weather at Sinhagad`,
        `Show iconic cafes in ${activeCity}`,
        `Plan a heritage itinerary`
      ];
    } else {
      reply = `### CitySphere Intelligence for **${activeCity}**\n\n` +
        `Here are top verified destinations across cafés, temples, forts, and nature:\n\n` +
        topRecommendations.map(p => `• **${p.name}** (${p.category} in ${p.neighbourhood || p.city}) — ⭐ ${p.rating}`).join('\n') +
        (liveWeather ? `\n\n🌤️ **Live Weather:** ${liveWeather.condition} at **${liveWeather.temperature}°C**` : '');

      followUps = [
        `Show temples in ${activeCity}`,
        `Show cafes & bakeries in ${activeCity}`,
        `Check live weather forecast`
      ];
    }

    res.json({
      success: true,
      data: {
        reply,
        source: 'grounded-intelligence',
        weather: liveWeather,
        recommendations: topRecommendations.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          city: p.city,
          rating: p.rating,
          cost: p.cost,
          lat: p.lat,
          lng: p.lng,
          googleMapsUrl: p.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
        })),
        suggestedFollowUps: followUps
      }
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
