import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inputFile = path.join(__dirname, 'datasets/raw/rows.csv');
if (!fs.existsSync(inputFile)) {
  inputFile = path.join(__dirname, '../DISASTER-GUARDIAN-main/backend/datasets/raw/rows.csv');
}

let outputDir = path.join(__dirname, 'datasets/cleaned');
if (!fs.existsSync(inputFile)) {
  outputDir = path.join(__dirname, '../DISASTER-GUARDIAN-main/backend/datasets/cleaned');
}
const outputFile = path.join(outputDir, 'landslides_clean.csv');

fs.mkdirSync(outputDir, { recursive: true });

const csv = fs.readFileSync(inputFile, 'utf8');

const columns = [
  'event_id',
  'event_date',
  'event_title',
  'event_description',
  'location_description',
  'landslide_category',
  'landslide_trigger',
  'landslide_size',
  'landslide_setting',
  'fatality_count',
  'injury_count',
  'country_name',
  'admin_division_name',
  'longitude',
  'latitude'
];

const records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
  bom: true
});

const output = [
  columns.join(','),
  ...records.map(row =>
    columns.map(column => {
      const value = row[column] ?? '';

      // Escape commas, quotes and new lines correctly
      if (
        String(value).includes(',') ||
        String(value).includes('"') ||
        String(value).includes('\n')
      ) {
        return `"${String(value).replace(/"/g, '""')}"`;
      }

      return String(value);
    }).join(',')
  )
];

fs.writeFileSync(outputFile, output.join('\n'), 'utf8');

console.log('Cleaned dataset created successfully!');
console.log(`Rows: ${records.length}`);
console.log(`Columns: ${columns.length}`);
console.log(`File: ${outputFile}`);