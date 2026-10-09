import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio') ? '.webm' : '.jpg');
    cb(null, `rep-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Clean in-memory reports store (populated ONLY by user submissions)
export let reportsStore = [];

// GET /api/reports - Fetch submitted citizen reports
router.get('/', (req, res) => {
  const { city, category, status } = req.query;
  let list = [...reportsStore];

  if (city && city.toLowerCase() !== 'all') {
    list = list.filter(r => (r.city || '').toLowerCase() === city.toLowerCase());
  }
  if (category && category !== 'All') {
    list = list.filter(r => r.category === category);
  }
  if (status && status !== 'All') {
    list = list.filter(r => r.status === status);
  }

  res.json({ success: true, count: list.length, data: list });
});

// POST /api/reports - Submit new citizen report
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const { title, description, category, city = 'Pune', neighbourhood, lat, lng, submittedBy = 'Citizen' } = req.body;

      if (!title || !description || !category || !lat || !lng) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
      }

      let photoUrl = null;
      let audioNoteUrl = null;

      if (req.files && req.files['photo'] && req.files['photo'][0]) {
        photoUrl = `/uploads/${req.files['photo'][0].filename}`;
      }
      if (req.files && req.files['audio'] && req.files['audio'][0]) {
        audioNoteUrl = `/uploads/${req.files['audio'][0].filename}`;
      }

      const newReport = {
        id: `rep-${Date.now()}`,
        title,
        description,
        category,
        city,
        neighbourhood: neighbourhood || city,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        status: 'Pending',
        severity: 'Medium',
        submittedBy,
        submittedAt: new Date().toISOString(),
        upvotes: 1,
        photoUrl,
        audioNoteUrl
      };

      reportsStore.unshift(newReport);
      res.status(201).json({ success: true, message: 'Report registered successfully', data: newReport });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PATCH /api/reports/:id/status - Update report status
router.patch('/:id/status', (req, res) => {
  const { status, moderationNotes } = req.body;
  const report = reportsStore.find(r => r.id === req.params.id);

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  report.status = status;
  if (moderationNotes) report.moderationNotes = moderationNotes;
  report.updatedAt = new Date().toISOString();

  res.json({ success: true, data: report });
});

// POST /api/reports/:id/upvote
router.post('/:id/upvote', (req, res) => {
  const report = reportsStore.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Not found' });
  report.upvotes = (report.upvotes || 0) + 1;
  res.json({ success: true, upvotes: report.upvotes });
});

export default router;
