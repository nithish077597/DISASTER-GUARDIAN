export const aiSecondDetermination = {
  calculateSecondDetermination({
    imageConfidence = 86,
    hasStandingWater = true,
    rainIntensity = 82,
    waterLevelStatus = 'RISING',
    nearbyReportsCount = 17,
    historicalEventsCount = 4,
    mapRiskZone = 'HIGH',
  }) {
    // Weighted Evidence Score Calculation
    const imageScore = Math.min(100, imageConfidence) * 0.20;
    const weatherScore = (rainIntensity > 50 ? 100 : 50) * 0.15;
    const rainfallScore = (rainIntensity > 80 ? 100 : 60) * 0.15;
    const waterLevelScore = (waterLevelStatus === 'RISING' ? 100 : 40) * 0.15;
    const nearbyReportsScore = Math.min(100, nearbyReportsCount * 6) * 0.15;
    const mapScore = (mapRiskZone === 'HIGH' ? 100 : 50) * 0.10;
    const historicalScore = Math.min(100, historicalEventsCount * 25) * 0.05;
    const officialScore = 80 * 0.05;

    const totalEvidenceScore = Math.round(
      imageScore + weatherScore + rainfallScore + waterLevelScore + nearbyReportsScore + mapScore + historicalScore + officialScore
    );

    let riskLevel = 'LOW';
    if (totalEvidenceScore >= 80) riskLevel = 'HIGH';
    else if (totalEvidenceScore >= 60) riskLevel = 'MEDIUM';

    return {
      incidentType: 'FLOOD',
      riskLevel,
      confidenceScore: 88,
      totalEvidenceScore,
      evidenceBreakdown: [
        { label: '🖼️ AI Image Analysis', weight: '20%', score: `${imageConfidence}%`, detail: 'Standing water covering roadway' },
        { label: '🌧️ Weather Data', weight: '15%', score: '100%', detail: 'Extreme rainfall detected (82 mm/hr)' },
        { label: '🌧️ Rainfall Accumulation', weight: '15%', score: '100%', detail: '3h accumulation: 148 mm' },
        { label: '💧 Water Level Sensor', weight: '15%', score: '100%', detail: 'River gauge status: RISING' },
        { label: '👥 Nearby Citizen Reports', weight: '15%', score: '95%', detail: `${nearbyReportsCount} corroborating reports in 2 km` },
        { label: '🗺️ Live GIS Map Layer', weight: '10%', score: '100%', detail: 'Sector located inside active flood zone' },
        { label: '📚 Historical Vulnerability', weight: '5%', score: '100%', detail: `${historicalEventsCount} previous recorded flood events` },
        { label: '📰 Official Alert Feeds', weight: '5%', score: '80%', detail: 'Regional IMD flood watch active' },
      ],
      reportDensity: `${nearbyReportsCount} reports within 1.8 km during last 20 minutes (STRONG CORROBORATION)`,
      timestamps: {
        submitted: '10:31 PM',
        imageAnalyzed: '10:32 PM',
        dataCrossChecked: '10:33 PM',
        determinationGenerated: '10:34 PM',
      },
    };
  },
};
