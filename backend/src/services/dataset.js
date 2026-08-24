import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = path.join(
  __dirname,
  '../../datasets/cleaned/landslides_clean.csv'
);

const loadDataset = () => {
  if (!fs.existsSync(datasetPath)) {
    throw new Error('Landslide dataset not found');
  }

  const csv = fs.readFileSync(datasetPath, 'utf8');

  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true
  });
};

const getDatasetInfo = () => {
  const data = loadDataset();

  return {
    file: 'landslides_clean.csv',
    rows: data.length,
    columns: data.length > 0 ? Object.keys(data[0]).length : 0
  };
};

const searchDataset = (query) => {
  const data = loadDataset();

  const q = query.toLowerCase();

  return data
    .filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(q)
      )
    )
    .slice(0, 50);
};

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );
};

const findNearbyHistoricalLandslides = (
  lat,
  lng,
  radiusKm = 25
) => {
  const data = loadDataset();

  return data.filter(row => {
    const rowLat = Number(row.latitude);
    const rowLng = Number(row.longitude);

    if (!Number.isFinite(rowLat) || !Number.isFinite(rowLng)) {
      return false;
    }

    return haversineKm(
      Number(lat),
      Number(lng),
      rowLat,
      rowLng
    ) <= radiusKm;
  });
};

export {
  getDatasetInfo,
  searchDataset,
  findNearbyHistoricalLandslides
};