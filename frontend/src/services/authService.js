import { usersApi } from '../api';

const STORAGE_KEY = 'disaster_mgmt_auth_user';
const DATASET_KEY = 'dg_citizen_dataset';
const ADMIN_SECRET_KEY = 'DISASTER-ADMIN-2026';

/* =====================================================
   LOCAL CITIZEN DATASET (mirror of backend SQLite users)
   Used when the backend is unreachable so login still works.
===================================================== */
export const citizenDataset = {
  all: () => {
    try {
      const data = localStorage.getItem(DATASET_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  upsert: (user) => {
    const dataset = citizenDataset.all();
    const idx = dataset.findIndex((u) => u.mobile === user.mobile);
    if (idx >= 0) {
      dataset[idx] = { ...dataset[idx], ...user, last_login: new Date().toISOString() };
    } else {
      dataset.push({ ...user, last_login: new Date().toISOString() });
    }
    localStorage.setItem(DATASET_KEY, JSON.stringify(dataset));
    return user;
  },
  findByMobile: (mobile) =>
    citizenDataset.all().find((u) => u.mobile === String(mobile).trim()) || null,
};

const defaultCitizenUser = {
  id: 'usr_cit_demo',
  name: 'Citizen',
  role: 'CITIZEN',
  mobile: '9876543210',
  location: 'Sulur, Coimbatore',
};

const defaultAdminUser = {
  id: 'usr_admin_01',
  name: 'NDRF Officer Command',
  role: 'ADMIN',
  email: 'admin@disastermanagement.gov.in',
  location: 'Emergency Operations Center',
};

export const authService = {
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultCitizenUser;
  },

  /* Register or log in with Name + Mobile Number + Location only.
     Stored in the backend dataset (SQLite users table); falls back
     to a local mirror dataset when the server is offline. */
  registerOrLogin: async ({ name, mobile, location, lat = null, lng = null }) => {
    const cleanName = String(name || '').trim();
    const cleanMobile = String(mobile || '').replace(/[^0-9+]/g, '').slice(-10);
    const cleanLocation = String(location || '').trim();

    if (!cleanName) throw new Error('Please enter your full name.');
    if (cleanMobile.length !== 10) throw new Error('Please enter a valid 10-digit mobile number.');
    if (!cleanLocation) throw new Error('Please enter your current location.');

    let storedUser = null;

    // Primary: persist to backend dataset (users table)
    try {
      storedUser = await usersApi.login({
        name: cleanName,
        mobile: cleanMobile,
        phone: cleanMobile,
        location: cleanLocation,
        lat,
        lng,
      });
    } catch {
      // Backend offline — use local dataset mirror
      const existing = citizenDataset.findByMobile(cleanMobile);
      storedUser = existing
        ? { ...existing, name: cleanName, location: cleanLocation, lat, lng }
        : { id: `usr_${Date.now()}`, name: cleanName };
      storedUser = citizenDataset.upsert({
        ...storedUser,
        name: cleanName,
        mobile: cleanMobile,
        location: cleanLocation,
        lat,
        lng,
        role: 'CITIZEN',
      });
    }

    const sessionUser = {
      id: storedUser?.id || `usr_${Date.now()}`,
      name: storedUser?.name || cleanName,
      role: 'CITIZEN',
      mobile: cleanMobile,
      location: storedUser?.location || cleanLocation,
      lat: storedUser?.lat ?? lat,
      lng: storedUser?.lng ?? lng,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  loginAdminWithSecretKey: async (username, password, secretKey) => {
    if (!secretKey || (secretKey.trim().toUpperCase() !== ADMIN_SECRET_KEY && secretKey.trim() !== 'ADMIN-SEC-2026-KEY')) {
      throw new Error('Invalid Admin Secret Key. Access denied to Emergency Operations Center.');
    }

    const user = { ...defaultAdminUser, name: username || 'NDRF Officer Command' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  isAuthenticated: () => {
    return !!authService.getCurrentUser();
  },

  hasRole: (requiredRole) => {
    const user = authService.getCurrentUser();
    return user && user.role === requiredRole;
  },
};
