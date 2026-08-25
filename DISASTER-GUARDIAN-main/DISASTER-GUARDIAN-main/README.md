# AI-Powered Disaster Guardian

College hackathon prototype. Verifies disaster reports, identifies people at risk, recommends safe evacuation locations, and sends targeted multi-channel alerts.

## Stack
- Backend: Node.js + Express + SQLite
- Frontend: React + Vite + Leaflet
- Admin: React + Vite + Leaflet
- Gateway: Node.js HTTP server (simulated ESP32/Pi)
- Maps: Leaflet / OpenStreetMap
- Weather: Open-Meteo API (free, no key)

## Quick Start
1. Copy `.env.example` to `.env` and fill values (Twilio optional — mock mode works without it).
2. `npm run install:all`
3. `npm run dev`
4. Backend runs on `http://localhost:5000`
5. Frontend runs on `http://localhost:5173`
6. Admin dashboard runs on `http://localhost:5174`

## Project Structure
```
disaster-guardian/
├── backend/          # API, verification, geo, alerts
├── frontend/         # Citizen report app + map
├── admin-dashboard/  # Admin/authority panel
├── gateway/          # ESP32/Pi + alert routing simulation
├── docs/             # README, architecture, API docs
└── .env.example
```

## Modules & Owners
| # | Member | Module | Phase |
|---|--------|--------|-------|
| 1 | | Backend core + DB (reports API) | 1 |
| 2 | | Verification & confidence scoring engine | 2 |
| 3 | | Danger zone + geofencing + safe-location logic | 3 & 4 |
| 4 | | Alert routing (SMS/voice/app, mock or Twilio) | 5 |
| 5 | | Zero-signal gateway (ESP32/Pi simulation) | 6 |
| 6 | | Frontend citizen app + Admin dashboard | 7 |

## Confidence Scoring Logic (for judges)
The verification engine fetches 24h rainfall from Open-Meteo and counts nearby reports within 2 km / last 6 hours.

Weights:
- Rainfall >= 50 mm in 24h: +40 points (heavy rain trigger)
- Rainfall 20–50 mm: +20 points
- Report count >= 5 within 2 km: +30 points
- Report count 2–4 within 2 km: +15 points
- Reporter reliability mock score: +10 points max

Score bands:
- 0–30: LOW_CONFIDENCE
- 31–60: CONFIRMED
- 61–80: HIGH_RISK
- 81–100: CRITICAL

## Alert Routing
- NORMAL: app notification log
- HIGH_RISK: app + SMS log
- CRITICAL: SMS + voice call log + app + gateway trigger

## Gateway
`/gateway/trigger` is called on CRITICAL alerts for remote zones. It simulates ESP32/Pi siren/voice output in the console.
