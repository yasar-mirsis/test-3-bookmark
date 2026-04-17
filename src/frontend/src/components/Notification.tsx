/**
 * Notification component for the Bookmark Manager application.
 * Displays toast notifications with different severity levels.
 */

import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
  /** Unique identifier for the notification */
  id: string;
  /** The notification message */
  message: string;
  /** The type/severity of the notification */
  type: NotificationType;
  /** Optional title for the notification */
  title?: string;
  /** Whether the notification is dismissible (default: true) */
  dismissible?: boolean;
  /** Auto-dismiss duration in milliseconds (default: 5000) */
  duration?: number;
}

export interface NotificationProps {
  /** The notification data to display */
  notification: NotificationData;
  /** Callback when the notification is dismissed */
  onDismiss: (id: string) => void;
}

const typeStyles: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

const typeColors: Record<NotificationType, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

/**
 * Notification component displaying a single toast notification.
 */
export const Notification: React.FC<NotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const { id, message, title, type, dismissible = true, duration = 5000 } = notification;
  const styles = typeStyles[type];
  const color = typeColors[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    onDismiss(id);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg} ${styles.border} shadow-md animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${color}`}>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={styles.icon}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${color} mb-1`}>
            {title}
          </p>
        )}
        <p className="text-sm text-gray-700">{message}</p>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${color} hover:opacity-75 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500 rounded`}
          aria-label="Dismiss notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * NotificationContainer component that manages a stack of notifications.
 */
export interface NotificationContainerProps {
  /** List of notifications to display */
  notifications: NotificationData[];
  /** Callback when a notification is dismissed */
  onDismiss: (id: string) => void;
  /** Maximum number of notifications to display */
  maxNotifications?: number;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
  maxNotifications = 5,
}) => {
  const visibleNotifications = notifications.slice(0, maxNotifications);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full"
      role="region"
      aria-label="Notifications"
    >
      {visibleNotifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
      
      {notifications.length > maxNotifications && (
        <div className="text-center text-sm text-gray-500 py-2">
          {notifications.length - maxNotifications} more notification
          {notifications.length - maxNotifications > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default Notification;
