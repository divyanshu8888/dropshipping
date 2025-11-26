import React, { createContext, useContext, useMemo, useState } from 'react';

export interface NotificationItem {
  id: string;
  type: 'message' | 'milestone';
  projectId: string;
  label: string;
  createdAt: string;
  seen: boolean;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  notificationCount: number;
  pushNotification: (notification: NotificationItem) => void;
  markAllNotificationsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const pushNotification = (notification: NotificationItem) => {
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) {
        return prev;
      }
      return [...prev, notification].slice(-50);
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((note) => (note.seen ? note : { ...note, seen: true })));
  };

  const value = useMemo(
    () => ({
      notifications,
      notificationCount: notifications.filter((note) => !note.seen).length,
      pushNotification,
      markAllNotificationsRead
    }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

