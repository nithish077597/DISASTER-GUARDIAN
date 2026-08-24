import express from 'express';

import {
  getDatasetInfo,
  searchDataset
} from '../services/dataset.js';

const router = express.Router();

router.get('/info', (req, res) => {
  try {
    const info = getDatasetInfo();

    res.json(info);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/search', (req, res) => {
  try {
    const query = req.query.q || '';

    if (!query.trim()) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const results = searchDataset(query);

    res.json({
      query,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;