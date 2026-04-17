/**
 * NotificationContext for the Bookmark Manager application.
 * Provides a global notification system for displaying toast messages.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationData, NotificationType } from '../components/Notification';

export interface NotificationContextType {
  /** Show a success notification */
  success: (message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => string;
  /** Show an error notification */
  error: (message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => string;
  /** Show a warning notification */
  warning: (message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => string;
  /** Show an info notification */
  info: (message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => string;
  /** Show a notification with custom type */
  show: (type: NotificationType, message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => string;
  /** Dismiss a specific notification by ID */
  dismiss: (id: string) => void;
  /** Dismiss all notifications */
  dismissAll: () => void;
  /** Get current list of notifications */
  notifications: NotificationData[];
}

interface NotificationContextProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationIdCounter = 0;

const generateId = (): string => {
  notificationIdCounter++;
  return `notification-${Date.now()}-${notificationIdCounter}`;
};

/**
 * Provider component for the NotificationContext.
 * Wraps the application and provides notification functionality to all descendants.
 */
export const NotificationProvider: React.FC<NotificationContextProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>): string => {
    const id = generateId();
    const newNotification: NotificationData = {
      id,
      type,
      message,
      dismissible: true,
      duration: 5000,
      ...options,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  }, []);

  const success = useCallback((message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => {
    return addNotification('success', message, options);
  }, [addNotification]);

  const error = useCallback((message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => {
    return addNotification('error', message, options);
  }, [addNotification]);

  const warning = useCallback((message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => {
    return addNotification('warning', message, options);
  }, [addNotification]);

  const info = useCallback((message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => {
    return addNotification('info', message, options);
  }, [addNotification]);

  const show = useCallback((type: NotificationType, message: string, options?: Partial<Omit<NotificationData, 'id' | 'type' | 'message'>>) => {
    return addNotification(type, message, options);
  }, [addNotification]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    success,
    error,
    warning,
    info,
    show,
    dismiss,
    dismissAll,
    notifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use the NotificationContext.
 * Must be used within a NotificationProvider.
 * @returns The notification context value
 * @throws Error if used outside of NotificationProvider
 */
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
}

export default NotificationContext;
