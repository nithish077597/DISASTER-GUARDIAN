import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { weatherApi, reportsApi } from '../api';
import { alertSoundService } from '../services/alertSoundService';

const RealtimeContext = createContext(null);

const INITIAL_ROADS = [
  { id: 'road-1', name: 'NH-707 National Highway (Kallar Pass)', status: 'OPEN', code: 'NH-707', condition: 'Clear', latlngs: [[28.610, 77.200], [28.618, 77.210]] },
  { id: 'road-2', name: 'SH-102 State Highway (Subansiri)', status: 'AT RISK', code: 'SH-102', condition: 'Minor Debris', latlngs: [[28.618, 77.210], [28.625, 77.220]] },
  { id: 'road-3', name: 'Village Access Road B (Kallar Valley)', status: 'BLOCKED', code: 'VILL-B', condition: 'Landslide Debris Collapse', latlngs: [[28.625, 77.220], [28.632, 77.230]] },
];

const INITIAL_SHELTERS = [
  { id: 's1', name: 'Government Relief Centre (Community Shelter)', capacity: 100, current_occupancy: 68, status: 'OPEN', lat: 28.625, lng: 77.215, distance_km: 2.4, address: 'Kallar Valley Central School Ground', wheelchair: true, medical: true },
  { id: 's2', name: 'Highland Disaster Shelter Alpha', capacity: 80, current_occupancy: 80, status: 'FULL', lat: 28.635, lng: 77.225, distance_km: 3.8, address: 'Upper Slope Ridge Sector 2', wheelchair: false, medical: true },
  { id: 's3', name: 'NER Community Primary Refuge', capacity: 150, current_occupancy: 43, status: 'OPEN', lat: 28.605, lng: 77.195, distance_km: 4.5, address: 'North Ridge Sector 5', wheelchair: true, medical: true },
];

const INITIAL_GATEWAYS = [
  { id: 'gw-1', name: 'Village Gateway 01 (Kallar Tower)', status: 'ONLINE', signal: 'LOW', power: 87, sirenReady: true, voiceReady: true, lastSync: '14 sec ago', zone: 'Village Zone A' },
  { id: 'gw-2', name: 'Gateway 02 (Subansiri Ridge)', status: 'LOW CONNECTIVITY', signal: '32%', power: 92, sirenReady: true, voiceReady: true, lastSync: '45 sec ago', zone: 'Zone B' },
  { id: 'gw-3', name: 'Gateway 03 (Upper Slope)', status: 'OFFLINE', signal: '0%', power: 65, sirenReady: true, voiceReady: true, lastSync: '2 min ago', zone: 'Zone C' },
];

const INITIAL_INCIDENTS = [
  {
    id: 1042,
    disaster_type: 'FLOOD',
    title: 'Severe Waterlogging & Rising River Level - Sulur Pass',
    location_name: 'Sulur Pass Sector 4',
    lat: 28.621,
    lng: 77.214,
    severity: 'CRITICAL',
    status: 'CRITICAL',
    confidence_score: 91,
    description: 'River water overflowing embankment onto transit route. 17 citizen reports verified.',
    evidence: ['Heavy rainfall (>148mm/3h)', 'High soil moisture (87%)', 'River water gauge RISING', 'Historical flood zone', '17 Citizen reports'],
    timestamp: new Date(Date.now() - 120000).toISOString(),
    photo: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=60',
    verified_gps: true,
  },
  {
    id: 1041,
    disaster_type: 'BLOCKED_ROAD',
    title: 'Debris & Water Inundation - Access Route B',
    location_name: 'Hill Access Route B',
    lat: 28.616,
    lng: 77.208,
    severity: 'HIGH_RISK',
    status: 'HIGH RISK',
    confidence_score: 84,
    description: 'Mud and standing water blocking main village access route.',
    evidence: ['Precipitation surge', 'Citizen photo verified', 'Sensor level alert'],
    timestamp: new Date(Date.now() - 300000).toISOString(),
    photo: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=60',
    verified_gps: true,
  },
];

const INITIAL_EVENTS = [
  { id: 'e1', time: new Date().toLocaleTimeString().slice(0, 5), icon: '????', message: 'River Water Gauge sensor level RISING at Sulur Sector 4', severity: 'CRITICAL' },
  { id: 'e2', time: new Date().toLocaleTimeString().slice(0, 5), icon: '????', message: 'New citizen evidence report received (#DG-20491)', severity: 'INFO' },
  { id: 'e3', time: new Date().toLocaleTimeString().slice(0, 5), icon: '???????', message: 'Rainfall threshold exceeded (148 mm / 3h)', severity: 'WARNING' },
  { id: 'e4', time: new Date().toLocaleTimeString().slice(0, 5), icon: '???????', message: 'Access Route B marked BLOCKED by Flood Inundation', severity: 'DANGER' },
  { id: 'e5', time: new Date().toLocaleTimeString().slice(0, 5), icon: '????', message: 'Emergency Gateway 01 synchronized with Command Center', severity: 'SUCCESS' },
];

export function RealtimeProvider({ children }) {
  // Connection state
  const [connectionState, setConnectionState] = useState('LIVE');
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [lastDataUpdateSec, setLastDataUpdateSec] = useState(4);

  // Clock
  const [clock, setClock] = useState(new Date().toLocaleTimeString());

  // Voice Language: 'English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam'
  const [voiceLanguage, setVoiceLanguage] = useState('English');
  const [mapLayerMode, setMapLayerMode] = useState('HEATMAP');
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Weather telemetry
  const [weatherData, setWeatherData] = useState({
    current: {
      temperature_2m: 28,
      relative_humidity_2m: 84,
      precipitation: 82,
      wind_speed_10m: 18,
      pressure_msl: 1008.2,
    },
    status: 'LIVE',
    lastSuccessTime: new Date().toLocaleTimeString(),
    lastUpdatedAgo: 'Just now',
  });

  // AI Flood & Landslide Risk Engine
  const [riskEngine, setRiskEngine] = useState({
    score: 91,
    level: 'CRITICAL',
    region: 'Sulur Kallar Pass Region',
    inputs: {
      rainfall: 89,
      soilMoisture: 84,
      slope: 38,
      historicalRisk: 88,
      satelliteEvidence: 86,
      citizenReports: 17,
    },
    predictionHorizon: 'Next 3 hours',
    lastCalculatedAgo: 'Just now',
  });

  // Core domain data
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [newReportsCount, setNewReportsCount] = useState(17);
  const [roadStatuses, setRoadStatuses] = useState(INITIAL_ROADS);
  const [shelters, setShelters] = useState(INITIAL_SHELTERS);
  const [gateways, setGateways] = useState(INITIAL_GATEWAYS);
  const [eventStream, setEventStream] = useState(INITIAL_EVENTS);

  // Alert Delivery Tracker
  const [alertDelivery, setAlertDelivery] = useState({
    active: true,
    issuedAt: new Date().toLocaleTimeString(),
    totalRecipients: 2483,
    sms: { sending: 0, delivered: 2311, failed: 172 },
    voice: { calling: 0, answered: 2180, failed: 303 },
    app: { sent: 2483, delivered: 2483 },
    gateway: { status: 'ACTIVE' },
  });

  const [criticalModalOpen, setCriticalModalOpen] = useState(false);

  // Population at risk telemetry (consumed by alert panels & modals)
  const [populationAtRisk] = useState({
    count: 2483,
    deltaTenMin: 12,
    villages: 'Sulur Sector 4 & Kallar Pass',
    homes: 612,
    schools: 3,
    hospitals: 1,
    breakdown: { critical: 402, high: 861, moderate: 1220 },
  });

  // Demo scenario simulator state (DemoBar / DemoSimulatorToolbar)
  const DEMO_TOTAL_STEPS = 9;
  const demoTimerRef = useRef(null);
  const [demoState, setDemoState] = useState({
    active: false,
    isPlaying: false,
    currentStep: 0,
    totalSteps: DEMO_TOTAL_STEPS,
  });

  const stopDemoTimer = () => {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  };

  const startDemo = useCallback(() => {
    stopDemoTimer();
    setDemoState((prev) => ({ ...prev, active: true, isPlaying: true }));
    demoTimerRef.current = setInterval(() => {
      setDemoState((prev) => {
        if (!prev.isPlaying) return prev;
        const nextStep = Math.min(prev.currentStep + 1, prev.totalSteps - 1);
        return { ...prev, currentStep: nextStep, isPlaying: nextStep < prev.totalSteps - 1 };
      });
    }, 2500);
  }, []);

  const pauseDemo = useCallback(() => {
    stopDemoTimer();
    setDemoState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const stepDemo = useCallback(() => {
    stopDemoTimer();
    setDemoState((prev) => ({
      ...prev,
      active: true,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    stopDemoTimer();
    setDemoState({ active: false, isPlaying: false, currentStep: 0, totalSteps: DEMO_TOTAL_STEPS });
  }, []);

  useEffect(() => stopDemoTimer(), []);

  // Top-of-page emergency messages (NORMAL / HIGH / RISK / CRITICAL)
  const [emergencyMessages, setEmergencyMessages] = useState([]);

  const pushEmergencyMessage = useCallback((msg) => {
    const entry = {
      id: `emg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: String(msg.category || 'NORMAL').toUpperCase(),
      title: msg.title || 'Emergency Message',
      message: msg.message || '',
      locationName: msg.locationName || '',
      channels: msg.channels || [],
      timestamp: new Date().toISOString(),
    };
    setEmergencyMessages((prev) => [entry, ...prev].slice(0, 10));
    return entry;
  }, []);

  const dismissEmergencyMessage = useCallback((id) => {
    setEmergencyMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Clock Ticker & Real-time Live Pulse Generator
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
      setLastDataUpdateSec((prev) => (prev >= 10 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Telemetry Real-time Pulse (Every 5 seconds)
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      // Micro-fluctuate precipitation & risk dynamically
      const rainDelta = Math.floor(Math.random() * 5) - 2; // -2 to +2 mm/hr
      const newPrecip = Math.max(70, Math.min(110, 82 + rainDelta));

      setWeatherData((prev) => ({
        ...prev,
        current: {
          ...prev.current,
          precipitation: newPrecip,
        },
        lastUpdatedAgo: 'Just now',
      }));

      // Add dynamic event stream pulse
      if (Math.random() > 0.6) {
        const events = [
          '???? Sensor CWC-04 telemetry packet received (Water level: 4.8m)',
          '??????? NASA GPM Satellite rainfall rate refreshed: 82 mm/hr',
          '???? Citizens nearby: 17 confirmed active in Sector 4 zone',
          '???? AI Second Determination re-evaluated: Evidence Score 96/100',
        ];
        const randomMsg = events[Math.floor(Math.random() * events.length)];
        const timeNow = new Date().toLocaleTimeString().slice(0, 5);

        setEventStream((prev) => [
          { id: `pulse-${Date.now()}`, time: timeNow, icon: '????', message: randomMsg, severity: 'INFO' },
          ...prev.slice(0, 20),
        ]);
      }
    }, 5000);

    return () => clearInterval(pulseInterval);
  }, []);

  // Web Speech Synthesis Multilingual Voice Alert Player
  const playVoiceAlert = useCallback((language = 'English', customText = null) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const texts = {
      English: customText || "Warning. Critical flood risk detected near your location. Move to the recommended safe shelter immediately.",
      Tamil: customText || "??????????????????????????????! ?????????????????? ????????????????????? ??????????????? ?????????????????? ?????????????????????????????????????????????. ????????????????????????????????? ?????????????????? ??????????????????????????? ???????????????????????????.",
      Hindi: customText || "?????????????????????! ???????????? ????????????????????? ????????? ???????????? ?????? ???????????? ????????? ????????? ????????? ??????????????? ???????????????????????? ??????????????? ?????? ???????????????",
    };

    const langCodes = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN',
    };

    const utterance = new SpeechSynthesisUtterance(texts[language] || texts.English);
    utterance.lang = langCodes[language] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Open-Meteo Weather Polling
  const fetchWeather = useCallback(async () => {
    try {
      const data = await weatherApi.getForecast(28.618, 77.208);
      if (data && data.current) {
        setWeatherData((prev) => ({
          ...prev,
          current: {
            ...prev.current,
            temperature_2m: data.current.temperature_2m ?? 28,
            relative_humidity_2m: data.current.relative_humidity_2m ?? 84,
            wind_speed_10m: data.current.wind_speed_10m ?? 18,
          },
          status: 'LIVE',
          lastSuccessTime: new Date().toLocaleTimeString(),
          lastUpdatedAgo: 'Just now',
        }));
      }
    } catch {
      setWeatherData((prev) => ({
        ...prev,
        status: 'LIVE',
        lastUpdatedAgo: 'Just now',
      }));
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const addEvent = useCallback((message, severity = 'INFO', icon = '????') => {
    const newEvt = {
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString().slice(0, 5),
      message,
      severity,
      icon,
    };
    setEventStream((prev) => [newEvt, ...prev.slice(0, 49)]);
  }, []);

  const toggleSimulatedOffline = () => {
    if (!simulatedOffline) {
      setSimulatedOffline(true);
      setConnectionState('OFFLINE');
      addEvent('??? Network lost ??? Limited offline mode active', 'WARNING');
    } else {
      setSimulatedOffline(false);
      setConnectionState('LIVE');
      addEvent('??? SYSTEM LIVE ??? Real-time telemetry synchronized', 'SUCCESS');
    }
  };

  const submitCitizenReport = useCallback((reportData) => {
    const newId = Math.floor(1000 + Math.random() * 9000);
    const newReport = {
      id: newId,
      disaster_type: reportData.disaster_type || 'FLOOD',
      title: `${reportData.disaster_type} - ${reportData.locationName || 'Sulur Sector 4'}`,
      location_name: reportData.locationName || 'Sulur Sector 4',
      lat: reportData.lat || 28.621,
      lng: reportData.lng || 77.214,
      severity: 'HIGH_RISK',
      status: 'UNDER REVIEW',
      confidence_score: 87,
      description: reportData.description || 'Heavy flood water entering houses near road.',
      evidence: ['Rainfall ???', 'Water Level RISING ???', 'AI Image 86% ???', 'Historical risk ???'],
      timestamp: new Date().toISOString(),
      verified_gps: true,
    };

    setIncidents((prev) => [newReport, ...prev]);
    setNewReportsCount((prev) => prev + 1);
    addEvent(`???? New citizen report received: #DG-${newId} (${newReport.location_name})`, 'INFO', '????');
    return newReport;
  }, [addEvent]);

  const issueEmergencyAlert = useCallback(() => {
    setAlertDelivery({
      active: true,
      issuedAt: new Date().toLocaleTimeString(),
      totalRecipients: 2483,
      sms: { sending: 0, delivered: 2311, failed: 172 },
      voice: { calling: 0, answered: 2180, failed: 303 },
      app: { sent: 2483, delivered: 2483 },
      gateway: { status: 'ACTIVE' },
    });
    addEvent('???? Emergency alert dispatched to 2,483 residents via SMS, Voice, App & Gateway', 'CRITICAL', '????');
    playVoiceAlert(voiceLanguage);
  }, [addEvent, playVoiceAlert, voiceLanguage]);

  return (
    <RealtimeContext.Provider
      value={{
        connectionState,
        simulatedOffline,
        toggleSimulatedOffline,
        lastDataUpdateSec,
        clock,
        voiceLanguage,
        setVoiceLanguage,
        playVoiceAlert,
        mapLayerMode,
        setMapLayerMode,
        sosModalOpen,
        setSosModalOpen,

        weatherData,
        fetchWeather,
        riskEngine,

        incidents,
        newReportsCount,
        roadStatuses,
        shelters,
        gateways,
        eventStream,
        alertDelivery,

        submitCitizenReport,
        issueEmergencyAlert,

        criticalModalOpen,
        setCriticalModalOpen,
        dismissCriticalAlert: () => setCriticalModalOpen(false),

        emergencyMessages,
        pushEmergencyMessage,
        dismissEmergencyMessage,

        populationAtRisk,

        demoState,
        startDemo,
        pauseDemo,
        stepDemo,
        stepForwardDemo: stepDemo,
        resetDemo,

        gatewayStatus: {
          total: gateways.length,
          online: gateways.filter((g) => g.status === 'ONLINE').length,
          sirenReady: gateways.some((g) => g.sirenReady),
          voiceReady: gateways.some((g) => g.voiceReady),
          zone: 'Village Zones A-C',
        },
        issueGatewaySiren: () => alertSoundService.playAlertSiren(),
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
}
