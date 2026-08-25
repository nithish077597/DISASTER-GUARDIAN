# Setup Guide

## Prerequisites
- Node.js >= 18
- npm >= 9

## Install
```bash
npm run install:all
```

## Environment
Copy `.env.example` to `.env` in the root and in `backend/` (or just rely on root `.env` if backend reads it).

## Run
```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`
- Admin on `http://localhost:5174`

## Run Gateway separately (optional)
```bash
cd gateway
npm install
npm run dev
```
Gateway runs on `http://localhost:6000`

## Testing
1. Open frontend, submit a report with lat/lng near Delhi (28.6, 77.2)
2. In admin dashboard, click "Map" to see the report
3. Click "Confirm" or set severity to CRITICAL
4. Trigger an alert via backend: `POST http://localhost:5000/api/alerts/send/1`
5. Check gateway console for trigger output if severity is CRITICAL
