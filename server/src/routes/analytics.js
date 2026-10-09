import express from 'express';
import { reportsStore } from './reports.js';

const router = express.Router();

// GET /api/analytics
router.get('/', (req, res) => {
  const { city = 'Pune' } = req.query;
  const filteredReports = reportsStore.filter(r => !city || city === 'All' || (r.city || '').toLowerCase() === city.toLowerCase());

  res.json({
    success: true,
    city,
    metrics: {
      totalReports: filteredReports.length,
      verifiedHazards: filteredReports.filter(r => r.status === 'Verified').length,
      resolvedIssues: filteredReports.filter(r => r.status === 'Resolved').length,
      pendingReview: filteredReports.filter(r => r.status === 'Pending').length
    }
  });
});

export default router;
