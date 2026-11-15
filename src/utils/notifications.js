import { useEffect, useState } from "react";
import { getUserKey } from "./userStorage";

const EVENT_NAME = "fitnova:notifications";

const notificationKey = () => getUserKey("fitnova_notifications");

const readList = () => {
  try {
    const list = JSON.parse(localStorage.getItem(notificationKey()) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const saveList = (list) => {
  try {
    localStorage.setItem(notificationKey(), JSON.stringify(list));
  } catch {
    // storage full / private mode - UI still updates in memory next load
  }
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getNotifications = () => readList();

export const addNotification = (notification) => {
  const list = readList();
  const id =
    notification.id ||
    `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (list.some((item) => item.id === id)) return;

  const item = {
    id,
    type: "system",
    title: "Notification",
    message: "",
    link: "",
    read: false,
    createdAt: new Date().toISOString(),
    ...notification
  };

  saveList([item, ...list].slice(0, 60));
};

export const markRead = (id) => {
  saveList(readList().map((item) => (item.id === id ? { ...item, read: true } : item)));
};

export const markAllRead = () => {
  saveList(readList().map((item) => ({ ...item, read: true })));
};

export const removeNotification = (id) => {
  saveList(readList().filter((item) => item.id !== id));
};

export const clearNotifications = () => {
  saveList([]);
};

// Demo community activity: social/forum module backend me nahi hai, is liye
// requirement ke mutabik sample notifications first visit par seed hoti hain.
export const seedCommunityNotifications = () => {
  const seedKey = getUserKey("fitnova_notifications_seeded");

  if (localStorage.getItem(seedKey) === "true") return;

  localStorage.setItem(seedKey, "true");

  const now = Date.now();

  addNotification({
    id: "welcome",
    type: "system",
    title: "Welcome to FitNova",
    message: "Your fitness dashboard is ready. Log your first workout to get started.",
    createdAt: new Date(now - 5 * 60 * 1000).toISOString()
  });

  addNotification({
    id: "sample-follower",
    type: "follower",
    title: "New follower",
    message: "Alex Morgan started following you.",
    link: "/profile",
    createdAt: new Date(now - 40 * 60 * 1000).toISOString()
  });

  addNotification({
    id: "sample-forum",
    type: "forum",
    title: "Forum response",
    message: "Jordan replied to your post: “Best pre-workout meal?”",
    link: "/dashboard",
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
  });
};

// Component ke saath sync rakhne ke liye chhota external store hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState(readList);

  useEffect(() => {
    const sync = () => setNotifications(readList());

    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    markRead,
    markAllRead,
    removeNotification,
    clearNotifications
  };
};
