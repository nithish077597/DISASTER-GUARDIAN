# API Documentation

Base URL: `http://localhost:5000`

## Health
- `GET /health` — { status: 'ok' }

## Reports
- `POST /api/reports` — Create report
  - Body: `{ disaster_type, lat, lng, description, timestamp, photo_url, reporter_id }`
- `GET /api/reports` — List reports
- `GET /api/reports/:id` — Get one report
- `PATCH /api/reports/:id` — Update status/severity/confidence_score

## Verification
- `POST /api/verification/:id/score` — Compute confidence + severity
  - Returns report with `weather` data from Open-Meteo

## Geo
- `GET /api/geo/danger-zone/:reportId` — Danger zone circle
  - Returns `{ center, radius_m, disaster_type, severity }`
- `GET /api/geo/safe-locations/:reportId` — Safe shelters outside danger zone
- `GET /api/geo/users-at-risk/:reportId` — Users inside danger zone

## Alerts
- `POST /api/alerts/send/:reportId` — Send alert
  - Channels: APP, SMS, VOICE, GATEWAY based on severity
- `GET /api/alerts` — Alert log

## Gateway
- `POST /gateway/trigger` — Called by backend on CRITICAL remote alert
  - Body: `{ report_id, disaster_type, severity, lat, lng, message }`
