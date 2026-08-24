import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports.js';
import verificationRouter from './routes/verification.js';
import geoRouter from './routes/geo.js';
import alertsRouter from './routes/alerts.js';
import { init } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

init();

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/reports', reportsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/geo', geoRouter);
app.use('/api/alerts', alertsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
