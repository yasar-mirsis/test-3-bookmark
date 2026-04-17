/**
 * useNotification hook for the Bookmark Manager application.
 * Provides a convenient API for showing notifications throughout the app.
 */

import { useNotification as useNotificationContext } from '../contexts/NotificationContext';
import { NotificationData, NotificationType } from '../components/Notification';

export interface UseNotificationReturn {
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
  /** Check if there are any notifications */
  hasNotifications: boolean;
  /** Get notification count */
  notificationCount: number;
}

/**
 * Custom hook for displaying notifications.
 * Provides a convenient API for showing success, error, warning, and info messages.
 * 
 * @example
 * ```tsx
 * const { success, error } = useNotification();
 * 
 * const handleSave = async () => {
 *   try {
 *     await saveBookmark();
 *     success('Bookmark saved successfully!');
 *   } catch (err) {
 *     error('Failed to save bookmark');
 *   }
 * };
 * ```
 * 
 * @example
 * ```tsx
 * const { info, dismiss } = useNotification();
 * const id = info('Processing...', { duration: 0 });
 * // Later: dismiss(id);
 * ```
 * 
 * @returns Object containing notification methods and state
 * @throws Error if used outside of NotificationProvider
 */
export function useNotification(): UseNotificationReturn {
  const context = useNotificationContext();

  return {
    ...context,
    hasNotifications: context.notifications.length > 0,
    notificationCount: context.notifications.length,
  };
}

export default useNotification;
