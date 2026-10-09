import express from 'express';

const router = express.Router();

// Real user-saved itineraries store (starts clean)
let itinerariesStore = [];

// GET /api/itineraries
router.get('/', (req, res) => {
  const { city } = req.query;
  let list = [...itinerariesStore];
  if (city) {
    list = list.filter(it => it.city?.toLowerCase() === city.toLowerCase());
  }
  res.json({ success: true, count: list.length, data: list });
});

// POST /api/itineraries
router.post('/', (req, res) => {
  const { title, city = 'Pune', stops = [], date, duration = 'Full Day' } = req.body;

  if (!title || stops.length === 0) {
    return res.status(400).json({ success: false, message: 'Title and at least one stop are required.' });
  }

  const newItinerary = {
    id: `itin-${Date.now()}`,
    title,
    city,
    date: date || new Date().toISOString().split('T')[0],
    duration,
    stops,
    createdAt: new Date().toISOString()
  };

  itinerariesStore.unshift(newItinerary);
  res.status(201).json({ success: true, data: newItinerary });
});

// DELETE /api/itineraries/:id
router.delete('/:id', (req, res) => {
  itinerariesStore = itinerariesStore.filter(i => i.id !== req.params.id);
  res.json({ success: true, message: 'Itinerary removed' });
});

export default router;
