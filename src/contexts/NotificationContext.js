import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingLocations } from '../services/locationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const updatePendingCount = async () => {
    if (!isAdmin) {
      setPendingCount(0);
      setLoading(false);
      return;
    }

    try {
      const result = await getPendingLocations();
      if (!result.error) {
        setPendingCount(result.documents.length);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePendingCount();

    // Poll every 30 seconds for new pending locations
    const interval = setInterval(() => {
      updatePendingCount();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const value = {
    pendingCount,
    updatePendingCount,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

