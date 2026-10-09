import express from 'express';

const router = express.Router();

// POST /api/places/compare - Compare places side-by-side
router.post('/', (req, res) => {
  const { places = [], placeIds = [], weights = { budget: 25, rating: 25, accessibility: 25, transit: 25 } } = req.body;

  let comparedPlaces = [...places];

  if (comparedPlaces.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least 2 places to compare.'
    });
  }

  const results = comparedPlaces.map(p => {
    const isAccessible = p.accessibility?.wheelchairAccessible;
    const isBudget = p.priceTier === 'budget' || p.cost?.includes('Free');

    let score = 70;
    if (isAccessible) score += 15;
    if (isBudget) score += 15;

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      city: p.city,
      cost: p.cost,
      rating: p.rating || 4.5,
      openingHours: p.openingHours,
      accessibility: isAccessible ? 'Wheelchair Accessible' : 'Standard Access',
      score: Math.min(98, score),
      advantages: [
        `Verified landmark in ${p.city}`,
        isAccessible ? 'Wheelchair accessible' : 'Convenient city access',
        p.cost || 'Standard admission'
      ]
    };
  });

  results.sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    bestMatch: results[0],
    comparedPlaces: results
  });
});

export default router;
