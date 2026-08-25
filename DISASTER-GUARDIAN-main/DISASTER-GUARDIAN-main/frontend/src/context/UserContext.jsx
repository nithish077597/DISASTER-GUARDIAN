import { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('disaster_guardian_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync user changes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('disaster_guardian_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('disaster_guardian_user');
    }
  }, [user]);

  const loginUser = async ({ name, phone, lat, lng }) => {
    setLoading(true);
    try {
      const payload = {
        id: user?.id,
        name,
        phone,
        lat: Number(lat),
        lng: Number(lng),
      };
      const loggedUser = await usersApi.login(payload);
      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const updateUserLocation = async (lat, lng) => {
    if (!user?.id) return;
    try {
      await usersApi.updateLocation({ id: user.id, lat: Number(lat), lng: Number(lng) });
      setUser((prev) => (prev ? { ...prev, lat: Number(lat), lng: Number(lng), last_active: new Date().toISOString() } : null));
    } catch (err) {
      console.error('Failed to sync location to backend:', err);
    }
  };

  const logoutUser = async () => {
    if (user?.id) {
      try {
        await usersApi.logout(user.id);
      } catch (err) {
        console.error('Error logging out from server:', err);
      }
    }
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        loginUser,
        updateUserLocation,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
