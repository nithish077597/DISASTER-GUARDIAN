import datasetRouter from './routes/dataset.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportsRouter from './routes/reports.js';
import verificationRouter from './routes/verification.js';
import geoRouter from './routes/geo.js';
import alertsRouter from './routes/alerts.js';
import usersRouter from './routes/users.js';
import teamMembersRouter from './routes/team-members.js';
import alertRulesRouter from './routes/alert-rules.js';
import alertAcknowledgmentsRouter from './routes/alert-acknowledgments.js';
import alertEscalationsRouter from './routes/alert-escalations.js';
import { init } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

init();

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/dataset', datasetRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/geo', geoRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/users', usersRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/alert-rules', alertRulesRouter);
app.use('/api/alert-acknowledgments', alertAcknowledgmentsRouter);
app.use('/api/alert-escalations', alertEscalationsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

