
import express from 'express';
import axios from 'axios';
import { getDb, persist } from '../config/db.js';
import { findNearbyHistoricalLandslides } from '../services/dataset.js';

const router = express.Router();

/* =====================================================
   HAVERSINE DISTANCE
   Calculates distance between two latitude/longitude
   coordinates in kilometers.
===================================================== */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
};


/* =====================================================
   FETCH RAINFALL FROM OPEN-METEO
===================================================== */
const fetchRainfall = async (lat, lng) => {

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lng}` +
    `&daily=precipitation_sum` +
    `&timezone=auto` +
    `&forecast_days=1`;

  try {

    const response = await axios.get(url);

    const today =
      response.data.daily?.time?.[0] ?? null;

    const precipitation =
      response.data.daily?.precipitation_sum?.[0] ?? 0;

    return {
      date: today,
      precipitation_mm:
        Number(precipitation) || 0
    };

  } catch (error) {

    console.error(
      'Open-Meteo fetch failed:',
      error.message
    );

    console.error(
      'URL:',
      url
    );

    return {
      date: null,
      precipitation_mm: 0
    };
  }
};


/* =====================================================
   FIND NEARBY CITIZEN REPORTS
   Looks for reports:
   - Same disaster type
   - Within previous 6 hours
   - Within 2 km
===================================================== */
const findNearbyReports = (db, report) => {

  const lat = Number(report.lat);
  const lng = Number(report.lng);

  const disasterType =
    report.disaster_type || '';

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return [];
  }

  let sixHoursAgo;

  try {

    sixHoursAgo = new Date(
      new Date(report.timestamp).getTime() -
      6 * 60 * 60 * 1000
    ).toISOString();

  } catch {

    sixHoursAgo = new Date(
      Date.now() -
      6 * 60 * 60 * 1000
    ).toISOString();
  }

  const safeType =
    disasterType.replace(/'/g, "''");

  const safeTimestamp =
    sixHoursAgo.replace(/'/g, "''");

  const sql = `
    SELECT *
    FROM reports
    WHERE id != ${Number(report.id) || 0}
      AND disaster_type = '${safeType}'
      AND timestamp >= '${safeTimestamp}'
  `;

  const result = db.exec(sql);

  if (!result[0]) {
    return [];
  }

  const columns =
    result[0].columns;

  const reports =
    (result[0].values || []).map(row =>
      Object.fromEntries(
        columns.map((column, index) => [
          column,
          row[index]
        ])
      )
    );

  return reports.filter(other => {

    const otherLat =
      Number(other.lat);

    const otherLng =
      Number(other.lng);

    if (
      !Number.isFinite(otherLat) ||
      !Number.isFinite(otherLng)
    ) {
      return false;
    }

    return (
      haversineKm(
        lat,
        lng,
        otherLat,
        otherLng
      ) <= 2
    );
  });
};


/* =====================================================
   SCORE VERIFICATION
===================================================== */
router.post('/:id/score', async (req, res) => {

  try {

    const db = await getDb();

    const reportId =
      Number(req.params.id);

    if (!Number.isInteger(reportId)) {

      return res.status(400).json({
        error: 'Invalid report ID'
      });
    }


    /* -------------------------------------------------
       GET REPORT
    ------------------------------------------------- */

    const result = db.exec(
      `SELECT * FROM reports WHERE id = ${reportId}`
    );

    const columns =
      result[0]?.columns;

    const row =
      result[0]?.values?.[0];

    const report = row
      ? Object.fromEntries(
          columns.map((column, index) => [
            column,
            row[index]
          ])
        )
      : null;

    if (!report) {

      return res.status(404).json({
        error: 'Report not found'
      });
    }


    const lat =
      Number(report.lat);

    const lng =
      Number(report.lng);


    /* =================================================
       1. WEATHER VERIFICATION
    ================================================= */

    const weather =
      await fetchRainfall(
        lat,
        lng
      );

    let rainfallPoints = 0;

    if (
      weather.precipitation_mm >= 50
    ) {

      rainfallPoints = 40;

    } else if (
      weather.precipitation_mm >= 20
    ) {

      rainfallPoints = 20;
    }


    /* =================================================
       2. NEARBY CITIZEN REPORTS
    ================================================= */

    const nearbyReports =
      findNearbyReports(
        db,
        report
      );

    let nearbyPoints = 0;

    if (
      nearbyReports.length >= 5
    ) {

      nearbyPoints = 30;

    } else if (
      nearbyReports.length >= 2
    ) {

      nearbyPoints = 15;
    }


    /* =================================================
       3. HISTORICAL LANDSLIDE DATASET

       Search within 100 km.
    ================================================= */

    let historicalMatches = [];

    try {

      historicalMatches =
        findNearbyHistoricalLandslides(
          lat,
          lng,
          100
        );

    } catch (error) {

      console.error(
        'Historical dataset search failed:',
        error.message
      );

      historicalMatches = [];
    }


    /* -------------------------------------------------
       HISTORICAL POINTS

       1 event  = 10 points
       2 events = 15 points
       5+       = 20 points
    ------------------------------------------------- */

    let historicalPoints = 0;

    if (
      historicalMatches.length >= 5
    ) {

      historicalPoints = 20;

    } else if (
      historicalMatches.length >= 2
    ) {

      historicalPoints = 15;

    } else if (
      historicalMatches.length >= 1
    ) {

      historicalPoints = 10;
    }


    /* =================================================
       4. REPORTER RELIABILITY

       Current system uses baseline value.
    ================================================= */

    const reporterPoints = 10;


    /* =================================================
       5. FINAL SCORE

       Rainfall        = 40
       Nearby reports  = 30
       Historical      = 20
       Reporter        = 10

       Maximum         = 100
    ================================================= */

    const score = Math.min(
      rainfallPoints +
      nearbyPoints +
      historicalPoints +
      reporterPoints,
      100
    );


    /* =================================================
       6. SEVERITY
    ================================================= */

    let severity =
      'LOW_CONFIDENCE';

    if (score >= 81) {

      severity = 'CRITICAL';

    } else if (score >= 61) {

      severity = 'HIGH_RISK';

    } else if (score >= 31) {

      severity = 'CONFIRMED';
    }


    /* =================================================
       7. SAVE SCORE TO DATABASE
    ================================================= */

    const statement = db.prepare(`
      UPDATE reports
      SET
        confidence_score = ?,
        severity = ?
      WHERE id = ?
    `);

    statement.run(
      score,
      severity,
      reportId
    );

    statement.free();

    persist();


    /* =================================================
       8. GET UPDATED REPORT
    ================================================= */

    const updatedResult = db.exec(
      `SELECT * FROM reports WHERE id = ${reportId}`
    );

    const updatedColumns =
      updatedResult[0]?.columns;

    const updatedRow =
      updatedResult[0]?.values?.[0];

    const updated = updatedRow
      ? Object.fromEntries(
          updatedColumns.map((column, index) => [
            column,
            updatedRow[index]
          ])
        )
      : null;


    /* =================================================
       9. RETURN COMPLETE VERIFICATION RESULT
    ================================================= */

    return res.json({

      ...updated,

      verification: {

        rainfall: {

          precipitation_mm:
            weather.precipitation_mm,

          points:
            rainfallPoints
        },


        nearby_reports: {

          count:
            nearbyReports.length,

          points:
            nearbyPoints,

          radius_km:
            2
        },


        historical_evidence: {

          count:
            historicalMatches.length,

          points:
            historicalPoints,

          radius_km:
            100,

          matches:
            historicalMatches.slice(0, 10)
        },


        reporter_reliability: {

          points:
            reporterPoints
        },


        total_score:
          score,

        severity:
          severity
      },


      weather
    });

  } catch (error) {

    console.error(
      'Verification failed:',
      error
    );

    return res.status(500).json({

      error:
        'Verification failed',

      message:
        error.message
    });
  }
});


/* =====================================================
   GET ALL VERIFICATION REPORTS
===================================================== */
router.get('/', async (req, res) => {

  try {

    const db = await getDb();

    const result = db.exec(
      'SELECT * FROM reports ORDER BY timestamp DESC'
    );

    if (!result[0]) {
      return res.json([]);
    }

    const columns =
      result[0].columns;

    const reports =
      (result[0].values || []).map(row =>
        Object.fromEntries(
          columns.map((column, index) => [
            column,
            row[index]
          ])
        )
      );

    return res.json(reports);

  } catch (error) {

    console.error(
      'Failed to load verification reports:',
      error.message
    );

    return res.status(500).json({

      error:
        'Failed to load reports'
    });
  }
});


export default router;

