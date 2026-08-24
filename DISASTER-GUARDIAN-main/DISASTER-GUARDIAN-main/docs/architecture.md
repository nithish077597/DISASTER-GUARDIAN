# Architecture

## Overview

```
Citizen App (React)  --->  Backend API (Express)  <---  Admin Dashboard (React)
                                        |
                                        v
                                [Open-Meteo API]
                                        |
                                        v
                                Alert Service (SMS/Voice/App)
                                        |
                                        v
                                Gateway (ESP32/Pi sim)
```

## Data Flow

1. Citizen submits report via `POST /api/reports`
2. Admin/backend calls `POST /api/verification/:id/score` which:
   - Fetches weather from Open-Meteo
   - Counts nearby reports
   - Computes confidence score
3. Admin calls `POST /api/alerts/send/:reportId`
4. Alert service routes to channels based on severity
5. For CRITICAL in remote zones, backend calls `POST /gateway/trigger`

## Database Schema

### reports
- id, disaster_type, lat, lng, description, timestamp, photo_url, reporter_id, confidence_score, severity, status

### shelters
- id, name, lat, lng, capacity, current_occupancy, disaster_types

### users
- id, lat, lng, phone, name

### alerts
- id, report_id, severity, channels, message, sent_at

## Components

- **Backend**: Express API with SQLite
- **Frontend**: Vite + React + Leaflet
- **Admin**: Vite + React + Leaflet
- **Gateway**: Express server simulating ESP32/Pi hardware
